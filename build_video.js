const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const { SCENES } = require('./niche_config.js');

ffmpeg.setFfmpegPath(ffmpegStatic);

// Output tracking
const generatedScenes = [];
const outputVideo = path.join(__dirname, 'final_video.mp4');

console.log('============================================');
console.log('🎬 BUILDING YOUTUBE VIDEO');
console.log('============================================\n');

/**
 * Builds a single scene video from image and voiceover
 */
function buildScene(scene, index) {
    return new Promise((resolve, reject) => {
        const audioName = `voiceover_scene_${scene.id}_${scene.name.toLowerCase()}.wav`;
        const audioPath = path.join(__dirname, audioName);
        const imagePath = path.join(__dirname, scene.img);
        const outputPath = path.join(__dirname, `temp_scene_${scene.id}.mp4`);
        
        // If image doesn't exist, provide a fallback or error
        if (!fs.existsSync(imagePath)) {
            console.error(`❌ Missing image for Scene ${scene.id}: ${imagePath}`);
            return reject(new Error('Missing image: ' + imagePath));
        }
        if (!fs.existsSync(audioPath)) {
            console.error(`❌ Missing audio for Scene ${scene.id}: ${audioPath}`);
            return reject(new Error('Missing audio: ' + audioPath));
        }

        console.log(`⏳ Processing Scene ${scene.id}/${SCENES.length}: ${scene.name}...`);
        
        ffmpeg()
            // Input Image (looped)
            .input(imagePath)
            .inputOptions(['-loop 1'])
            // Input Audio
            .input(audioPath)
            // Options
            .outputOptions([
                '-c:v libx264',
                '-c:a aac',
                '-b:a 192k',
                '-pix_fmt yuv420p',
                '-shortest', // Stop when audio ends
                '-vf scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2'
            ])
            .save(outputPath)
            .on('progress', (progress) => {
                if (progress.percent) {
                    const percent = Math.floor(progress.percent);
                    if (process.stdout.isTTY) {
                        process.stdout.write(`   Render ${scene.id}: ${percent}% \r`);
                    } else if (percent % 20 === 0) {
                        console.log(`   Render ${scene.id}: ${percent}%`);
                    }
                }
            })
            .on('end', () => {
                console.log(`   ✅ Scene ${scene.id} rendered`);
                generatedScenes.push(outputPath);
                resolve(outputPath);
            })
            .on('error', (err) => {
                console.error(`   ❌ Failed rendering scene ${scene.id}:`, err);
                reject(err);
            });
    });
}

/**
 * Merges all rendered scene clips into the final video
 */
function mergeScenes() {
    return new Promise((resolve, reject) => {
        if (generatedScenes.length === 0) return reject('No scenes to merge.');
        
        // Ensure scenes are in correct order numerically
        generatedScenes.sort((a,b) => {
            const idA = parseInt(a.match(/temp_scene_(\d+)/)[1]);
            const idB = parseInt(b.match(/temp_scene_(\d+)/)[1]);
            return idA - idB;
        });

        console.log('\n⏳ Merging all scenes into Final Video...');
        
        const listPath = path.join(__dirname, 'concat_list.txt');
        const listContent = generatedScenes.map(file => `file '${file.replace(/\\/g, '/')}'`).join('\n');
        fs.writeFileSync(listPath, listContent);

        ffmpeg()
            .input(listPath)
            .inputOptions(['-f concat', '-safe 0'])
            .outputOptions(['-c copy'])
            .save(outputVideo)
            .on('end', () => {
                console.log(`\n🎉 SUCCESS! Final video merged successfully.`);
                console.log(`🔗 Output: ${outputVideo}`);
                
                // Cleanup temp files
                console.log('🧹 Cleaning up temporary files...');
                fs.unlinkSync(listPath);
                generatedScenes.forEach(f => fs.unlinkSync(f));
                
                console.log('\n============================================');
                console.log('   📹 YOUR VIDEO IS READY TO BE UPLOADED');
                console.log('   Run: node upload_to_youtube.js final_video.mp4');
                console.log('============================================');
                resolve();
            })
            .on('error', (err) => {
                console.error('❌ Failed merging scenes:', err);
                reject(err);
            });
    });
}

async function run() {
    try {
        // Build all scenes sequentially
        for (let i = 0; i < SCENES.length; i++) {
            await buildScene(SCENES[i], i);
        }
        // Merge into one video
        await mergeScenes();
    } catch (err) {
        console.error('\n❌ Build Process Failed:', err.message);
        console.log('\nMake sure you have generated the voiceovers first using:');
        console.log('node generate_voiceover.js');
    }
}

run();
