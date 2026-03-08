/**
 * 🎙️ Sarvam AI Voiceover Generator
 * ===================================
 * Generates Hindi voiceover using Sarvam AI's Bulbul v3 TTS model
 * 
 * SETUP:
 *   1. Get your API key from https://dashboard.sarvam.ai/
 *   2. Set it in .env file or pass as argument
 *   3. Run: node generate_voiceover.js
 * 
 * OUTPUT: voiceover_final.wav (full merged audio)
 *         voiceover_scene_1.wav, voiceover_scene_2.wav, etc. (per-scene audio)
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// ============================================================
// ⚙️ CONFIGURATION
// ============================================================

const CONFIG = {
    // 🔑 Sarvam AI API Key — Get yours at https://dashboard.sarvam.ai/
    API_KEY: process.env.SARVAM_API_KEY || 'sk_aqlk3i13_mTuUOROjLOLjah0BZzd5Hs96',

    // 🎤 Model & Voice Settings
    MODEL: 'bulbul:v3',           // Latest model with best quality
    SPEAKER: 'shubh',            // Male, Conversational (Hindi) — Best for YouTube narration
    LANGUAGE: 'hi-IN',           // Hindi (India)
    PACE: 1.05,                  // Slightly faster for engaging narration (0.5–2.0)
    TEMPERATURE: 0.7,            // Balanced expressiveness (0.01–2.0)
    SAMPLE_RATE: 44100,          // High quality for YouTube (8000–48000 Hz)

    // 📂 Output Settings
    OUTPUT_DIR: path.join(__dirname),
    FINAL_FILENAME: 'voiceover_final.wav',
};

// ============================================================
// 📝 SCRIPT SCENES — Loaded from niche_config.js
// ============================================================

const { SCENES } = require('./niche_config.js');

// ============================================================
// 🔊 AVAILABLE VOICES (for reference)
// ============================================================

const AVAILABLE_VOICES = {
    'bulbul:v3': {
        recommended_for_youtube: [
            { name: 'Shubh', gender: 'Male', style: 'Conversational — Best for narration' },
            { name: 'Manan', gender: 'Male', style: 'Conversational — Warm and engaging' },
            { name: 'Shreya', gender: 'Female', style: 'News — Clear and authoritative' },
            { name: 'Ishita', gender: 'Female', style: 'Entertainment — Energetic' },
            { name: 'Aditya', gender: 'Male', style: 'Neutral — Professional' },
            { name: 'Ritu', gender: 'Female', style: 'Friendly — Approachable' },
        ],
        all: [
            'Shubh', 'Aditya', 'Ritu', 'Priya', 'Neha', 'Rahul', 'Pooja', 'Rohan',
            'Simran', 'Kavya', 'Amit', 'Dev', 'Ishita', 'Shreya', 'Ratan', 'Varun',
            'Manan', 'Sumit', 'Roopa', 'Kabir', 'Aayan', 'Ashutosh', 'Advait',
            'Amelia', 'Sophia', 'Anand', 'Tanya', 'Tarun', 'Sunny', 'Mani',
            'Gokul', 'Vijay', 'Shruti', 'Suhani', 'Mohit', 'Kavitha', 'Rehan',
            'Soham', 'Rupali'
        ]
    },
    'bulbul:v2': {
        female: ['Anushka', 'Manisha', 'Vidya', 'Arya'],
        male: ['Abhilash', 'Karun', 'Hitesh'],
    }
};

// ============================================================
// 🛠️ SARVAM AI TTS ENGINE
// ============================================================

/**
 * Convert text to speech using Sarvam AI API
 * @param {string} text - Hindi text to convert
 * @returns {Promise<Buffer>} - WAV audio buffer
 */
function textToSpeech(text) {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify({
            text: text,
            target_language_code: CONFIG.LANGUAGE,
            model: CONFIG.MODEL,
            speaker: CONFIG.SPEAKER,
            pace: CONFIG.PACE,
            temperature: CONFIG.TEMPERATURE,
            sample_rate: CONFIG.SAMPLE_RATE,
        });

        const options = {
            hostname: 'api.sarvam.ai',
            path: '/text-to-speech',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-subscription-key': CONFIG.API_KEY,
                'Content-Length': Buffer.byteLength(payload),
            },
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    if (res.statusCode !== 200) {
                        reject(new Error(`API Error ${res.statusCode}: ${data}`));
                        return;
                    }
                    const response = JSON.parse(data);
                    if (response.audios && response.audios.length > 0) {
                        const audioBuffer = Buffer.from(response.audios[0], 'base64');
                        resolve(audioBuffer);
                    } else {
                        reject(new Error('No audio data in response'));
                    }
                } catch (err) {
                    reject(new Error(`Failed to parse response: ${err.message}`));
                }
            });
        });

        req.on('error', (err) => reject(err));
        req.write(payload);
        req.end();
    });
}

/**
 * Generate silence buffer (WAV format)
 * @param {number} durationMs - Duration in milliseconds
 * @returns {Buffer} - WAV silence buffer (raw PCM only, no header)
 */
function generateSilence(durationMs) {
    const numSamples = Math.floor((CONFIG.SAMPLE_RATE * durationMs) / 1000);
    const bytesPerSample = 2; // 16-bit
    return Buffer.alloc(numSamples * bytesPerSample, 0);
}

/**
 * Create WAV header
 * @param {number} dataSize - Size of audio data in bytes
 * @returns {Buffer} - 44-byte WAV header
 */
function createWavHeader(dataSize) {
    const header = Buffer.alloc(44);
    const channels = 1;
    const bitsPerSample = 16;
    const byteRate = CONFIG.SAMPLE_RATE * channels * (bitsPerSample / 8);
    const blockAlign = channels * (bitsPerSample / 8);

    header.write('RIFF', 0);
    header.writeUInt32LE(36 + dataSize, 4);
    header.write('WAVE', 8);
    header.write('fmt ', 12);
    header.writeUInt32LE(16, 16);           // Subchunk1Size (PCM)
    header.writeUInt16LE(1, 20);            // AudioFormat (PCM)
    header.writeUInt16LE(channels, 22);
    header.writeUInt32LE(CONFIG.SAMPLE_RATE, 24);
    header.writeUInt32LE(byteRate, 28);
    header.writeUInt16LE(blockAlign, 32);
    header.writeUInt16LE(bitsPerSample, 34);
    header.write('data', 36);
    header.writeUInt32LE(dataSize, 40);

    return header;
}

/**
 * Extract raw PCM data from WAV buffer (skip header)
 * @param {Buffer} wavBuffer - Full WAV file buffer
 * @returns {Buffer} - Raw PCM data
 */
function extractPCMFromWav(wavBuffer) {
    // Find the 'data' chunk
    for (let i = 0; i < wavBuffer.length - 8; i++) {
        if (wavBuffer.toString('ascii', i, i + 4) === 'data') {
            const dataSize = wavBuffer.readUInt32LE(i + 4);
            return wavBuffer.slice(i + 8, i + 8 + dataSize);
        }
    }
    // Fallback: skip standard 44-byte header
    return wavBuffer.slice(44);
}

// ============================================================
// 🚀 MAIN EXECUTION
// ============================================================

async function main() {
    console.log('');
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║   🎙️  SARVAM AI VOICEOVER GENERATOR                     ║');
    console.log('║   Model: Bulbul v3 | Language: Hindi | Voice: ' + CONFIG.SPEAKER.padEnd(9) + '  ║');
    console.log('╚══════════════════════════════════════════════════════════╝');
    console.log('');

    // Validate API Key
    if (CONFIG.API_KEY === 'YOUR_SARVAM_API_KEY_HERE') {
        console.log('❌ ERROR: Please set your Sarvam AI API key!');
        console.log('');
        console.log('   Option 1: Set environment variable');
        console.log('     $env:SARVAM_API_KEY = "your-key-here"');
        console.log('');
        console.log('   Option 2: Edit this file');
        console.log('     Change API_KEY in CONFIG section');
        console.log('');
        console.log('   Get your key at: https://dashboard.sarvam.ai/');
        console.log('');
        process.exit(1);
    }

    const allPCMBuffers = [];
    let totalScenes = SCENES.length;
    let completedScenes = 0;

    console.log(`📋 Total scenes to generate: ${totalScenes}`);
    console.log(`🎤 Voice: ${CONFIG.SPEAKER} | Pace: ${CONFIG.PACE}x | Sample Rate: ${CONFIG.SAMPLE_RATE}Hz`);
    console.log('');

    for (const scene of SCENES) {
        try {
            const progressBar = '█'.repeat(Math.floor((completedScenes / totalScenes) * 20));
            const emptyBar = '░'.repeat(20 - progressBar.length);
            console.log(`[${progressBar}${emptyBar}] Scene ${scene.id}/${totalScenes}: ${scene.name}`);
            console.log(`   📝 "${scene.text.substring(0, 60)}..."`);

            // Generate speech for this scene
            const startTime = Date.now();
            const audioBuffer = await textToSpeech(scene.text);
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

            console.log(`   ✅ Generated in ${elapsed}s (${(audioBuffer.length / 1024).toFixed(1)} KB)`);

            // Save individual scene audio
            const sceneFilename = `voiceover_scene_${scene.id}_${scene.name.toLowerCase()}.wav`;
            const sceneFilePath = path.join(CONFIG.OUTPUT_DIR, sceneFilename);
            fs.writeFileSync(sceneFilePath, audioBuffer);
            console.log(`   💾 Saved: ${sceneFilename}`);

            // Extract PCM for merging
            const pcmData = extractPCMFromWav(audioBuffer);
            allPCMBuffers.push(pcmData);

            // Add pause between scenes (silence)
            if (scene.pauseMs > 0) {
                const silence = generateSilence(scene.pauseMs);
                allPCMBuffers.push(silence);
                console.log(`   ⏸️  Added ${scene.pauseMs}ms pause`);
            }

            completedScenes++;
            console.log('');

            // Small delay to avoid rate limiting
            if (scene.id < totalScenes) {
                await new Promise(r => setTimeout(r, 500));
            }
        } catch (error) {
            console.error(`   ❌ Error on Scene ${scene.id}: ${error.message}`);
            console.log('');

            if (error.message.includes('401') || error.message.includes('403')) {
                console.log('🔑 Authentication failed. Check your API key.');
                process.exit(1);
            }
            if (error.message.includes('429')) {
                console.log('⏳ Rate limited. Waiting 5 seconds...');
                await new Promise(r => setTimeout(r, 5000));
                // Retry once
                try {
                    const audioBuffer = await textToSpeech(scene.text);
                    const pcmData = extractPCMFromWav(audioBuffer);
                    allPCMBuffers.push(pcmData);
                    if (scene.pauseMs > 0) {
                        allPCMBuffers.push(generateSilence(scene.pauseMs));
                    }
                    completedScenes++;
                    console.log(`   ✅ Retry successful!`);
                } catch (retryErr) {
                    console.error(`   ❌ Retry also failed: ${retryErr.message}`);
                }
            }
        }
    }

    // Merge all PCM buffers into one WAV file
    if (allPCMBuffers.length > 0) {
        console.log('═══════════════════════════════════════════════');
        console.log('🔗 Merging all scenes into final voiceover...');

        const mergedPCM = Buffer.concat(allPCMBuffers);
        const wavHeader = createWavHeader(mergedPCM.length);
        const finalWav = Buffer.concat([wavHeader, mergedPCM]);

        const finalPath = path.join(CONFIG.OUTPUT_DIR, CONFIG.FINAL_FILENAME);
        fs.writeFileSync(finalPath, finalWav);

        const durationSec = (mergedPCM.length / (CONFIG.SAMPLE_RATE * 2)).toFixed(1);
        const fileSizeMB = (finalWav.length / (1024 * 1024)).toFixed(2);

        console.log('');
        console.log('╔══════════════════════════════════════════════════════════╗');
        console.log('║   ✅ VOICEOVER GENERATION COMPLETE!                      ║');
        console.log('╠══════════════════════════════════════════════════════════╣');
        console.log(`║   📁 File: ${CONFIG.FINAL_FILENAME.padEnd(43)} ║`);
        console.log(`║   ⏱️  Duration: ~${durationSec}s${' '.repeat(40 - durationSec.length)}║`);
        console.log(`║   📦 Size: ${fileSizeMB} MB${' '.repeat(40 - fileSizeMB.length)}║`);
        console.log(`║   🎤 Voice: ${CONFIG.SPEAKER} (${CONFIG.MODEL})${' '.repeat(29 - CONFIG.SPEAKER.length - CONFIG.MODEL.length)}║`);
        console.log(`║   🎵 Sample Rate: ${CONFIG.SAMPLE_RATE} Hz${' '.repeat(34 - String(CONFIG.SAMPLE_RATE).length)}║`);
        console.log('╠══════════════════════════════════════════════════════════╣');
        console.log('║   📂 Individual scene files also saved!                  ║');
        console.log('╚══════════════════════════════════════════════════════════╝');
        console.log('');
        console.log('🎬 Next steps:');
        console.log('   1. Import voiceover_final.wav into your video editor');
        console.log('   2. Sync with scene images from scenes.json');
        console.log('   3. Add subtitles from subtitles.srt');
        console.log('   4. Add background music + sound effects');
        console.log('');
    } else {
        console.log('❌ No audio was generated. Please check errors above.');
    }
}

// Run the generator
main().catch((err) => {
    console.error('Fatal error:', err.message);
    process.exit(1);
});
