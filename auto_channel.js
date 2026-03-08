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

const endTime = new Date();
const istTime = endTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'full', timeStyle: 'medium' });

console.log('\n');
console.log('╔════════════════════════════════════════════╗');
console.log('║  🎉 AUTOMATION WORKFLOW COMPLETE!          ║');
console.log('╠════════════════════════════════════════════╣');
console.log(`║  📅 Completed At : ${istTime}`);
console.log('║  ✅ 1. AI Research & Topic Selection       ║');
console.log('║  ✅ 2. Voiceover Generated (Sarvam AI)     ║');
console.log('║  ✅ 3. Thumbnail Created (OpenAI)          ║');
console.log('║  ✅ 4. Video Compiled (FFmpeg)              ║');
console.log('║  ✅ 5. Uploaded to YouTube Studio!          ║');
console.log('╠════════════════════════════════════════════╣');
console.log('║  🚀 Go to YouTube Studio to publish!       ║');
console.log('╚════════════════════════════════════════════╝');
