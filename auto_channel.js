const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('============================================');
console.log('🤖 FULL AI YOUTUBE AUTOMATION WORKFLOW');
console.log('============================================\n');

function runCommand(command) {
    console.log(`\n>> Running: ${command}`);
    try {
        execSync(command, { stdio: 'inherit' });
    } catch (error) {
        console.error(`\n❌ Step Failed: ${command}`);
        console.error('Please fix the errors above and run again.');
        process.exit(1);
    }
}

// 1. AI Research & Brainstorming (Optional: Requires GEMINI_API_KEY)
if (process.env.GEMINI_API_KEY) {
    runCommand('node ai_brain.js');
}

// 2. Generate Voiceovers (Requires Sarvam API)
runCommand('node generate_voiceover.js');

// 3. Generate Thumbnail (Optional: Requires OPENAI_API_KEY)
if (process.env.OPENAI_API_KEY) {
    runCommand('node generate_thumbnail.js');
}

// 4. Build the Full Video
runCommand('node build_video.js');

// 3. Upload to YouTube API
runCommand('node upload_to_youtube.js final_video.mp4');

console.log('\n============================================');
console.log('🎉 THE AUTOMATION WORKFLOW IS COMPLETE!');
console.log('✅ 1. AI Voiceover generated');
console.log('✅ 2. Visuals & Audio compiled');
console.log('✅ 3. Metadata packaged');
console.log('✅ 4. Video uploaded to YouTube Studio');
console.log('Go to YouTube Studio to view and publish your new video!');
console.log('============================================');
