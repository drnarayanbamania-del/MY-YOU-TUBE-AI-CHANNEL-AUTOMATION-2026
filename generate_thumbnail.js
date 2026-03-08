const axios = require('axios');
const fs = require('fs');
const path = require('path');
const config = require('./niche_config.js');
const THUMBNAIL_PROMPT = config.THUMBNAIL_PROMPT || "A cinematic AI technology background for a YouTube video about AI research.";
const THUMBNAIL_TEXT = config.THUMBNAIL_TEXT || "AI REVOLUTION";

// ==========================================
// 🖼️ AUTOMATIC THUMBNAIL GENERATOR
// ==========================================
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function generateThumbnail() {
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY') {
        console.log('⚠️ Skipping Automatic Thumbnail (No OpenAI Key provided)');
        console.log('   Add your OPENAI_API_KEY to the dashboard to enable this feature.');
        return;
    }

    console.log('\n============================================');
    console.log('🖼️ GENERATING VIRAL THUMBNAIL');
    console.log('============================================');
    console.log(`Prompt: ${THUMBNAIL_PROMPT.substring(0, 100)}...`);

    try {
        const response = await axios.post(
            'https://api.openai.com/v1/images/generations',
            {
                model: "dall-e-3",
                prompt: THUMBNAIL_PROMPT,
                n: 1,
                size: "1024x1024", // Resize to 16:9 handled in upload/video if needed, but 1:1 is standard for prompts
            },
            {
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const imageUrl = response.data.data[0].url;
        const imagePath = path.join(__dirname, 'agi_thumbnail.png');

        // Download the image
        const writer = fs.createWriteStream(imagePath);
        const imageRes = await axios({
            url: imageUrl,
            method: 'GET',
            responseType: 'stream'
        });

        imageRes.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', () => {
                console.log('✅ Thumbnail generated successfully: agi_thumbnail.png');
                console.log(`💡 AI Suggested Text Overlay: "${THUMBNAIL_TEXT}"`);
                resolve();
            });
            writer.on('error', reject);
        });

    } catch (error) {
        console.error('❌ Thumbnail Generation Error:', error.response ? error.response.data : error.message);
    }
}

if (require.main === module) {
    generateThumbnail();
}

module.exports = { generateThumbnail };
