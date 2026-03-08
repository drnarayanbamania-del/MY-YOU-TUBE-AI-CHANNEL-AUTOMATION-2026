const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// ==========================================
// 🧠 AI RESEARCHER CONFIGURATION
// ==========================================
const GENAI_API_KEY = process.env.GEMINI_API_KEY; // I will help you set this!

async function researchAndBrainstorm() {
    if (!GENAI_API_KEY || GENAI_API_KEY === 'YOUR_GEMINI_API_KEY') {
        console.log('❌ GEMINI_API_KEY is missing. Searching for existing config...');
        return;
    }

    console.log('🔍 Researching trending AI topics for YouTube...');
    const genAI = new GoogleGenerativeAI(GENAI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
    You are an expert YouTube Content Strategist for an AI News channel called "AI mdico" in Hindi.
    Your goal is to brainstorm a highly engaging, viral video topic about Artificial Intelligence (e.g., New OpenAI model, Robot breakthroughs, AI dangers, AGI).

    Return ONLY a JSON object with this exact structure:
    {
      "CHANNEL_NAME": "AI mdico",
      "CHANNEL_URL": "https://www.youtube.com/channel/UCktdIQoSfHOwmJ1wqToROpQ",
      "VIDEO_NICHE": "Short viral title in English",
      "THUMBNAIL_PROMPT": "A highly detailed DALL-E 3 prompt for a cinematic YouTube thumbnail without text...",
      "THUMBNAIL_TEXT": "Viral text overlay (max 4 words)",
      "SCENES": [
        { "id": 1, "name": "HOOK", "duration": "0-7s", "text": "Hindi script line...", "camera": "Camera movement description", "img": "path_to_relevant_image_concept", "pauseMs": 800 },
        ... (generate 7 scenes total)
      ],
      "TAGS": ["tag1", "..."],
      "HASHTAGS": ["#AImdico", "..."]
    }

    The script MUST be in high-quality, engaging Hindi (Hinglish mixed for tech terms). 
    The focus should be "Mind-blowing" and "Informative".
    `;

    try {
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            safetySettings: [
                { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
                { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
                { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
                { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
            ]
        });
        
        const response = await result.response;
        const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        
        console.log('✅ AI Brainstorming Successful');
        
        const config = JSON.parse(text);
        
        // Write it to niche_config.js
        const fileContent = `// ==========================================
// ⚙️ AUTO-GENERATED CONFIGURATION (DRIVERLESS TESLA MODE)
// Generated on: ${new Date().toLocaleString()}
// ==========================================

const CHANNEL_NAME = "${config.CHANNEL_NAME}";
const CHANNEL_URL = "${config.CHANNEL_URL}";
const VIDEO_NICHE = "${config.VIDEO_NICHE}";
const THUMBNAIL_PROMPT = "${config.THUMBNAIL_PROMPT.replace(/"/g, '\\"')}";
const THUMBNAIL_TEXT = "${config.THUMBNAIL_TEXT.replace(/"/g, '\\"')}";

const SCENES = ${JSON.stringify(config.SCENES, null, 4)};

const TAGS = ${JSON.stringify(config.TAGS)};

const HASHTAGS = ${JSON.stringify(config.HASHTAGS)};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CHANNEL_NAME, CHANNEL_URL, VIDEO_NICHE, THUMBNAIL_PROMPT, THUMBNAIL_TEXT, SCENES, TAGS, HASHTAGS };
}
`;
        fs.writeFileSync(path.join(__dirname, 'niche_config.js'), fileContent);
        console.log(`✅ AI Research Complete! New Niche: ${config.VIDEO_NICHE}`);
        
    } catch (error) {
        console.error('❌ AI Research Error:', error.message);
    }
}

researchAndBrainstorm();
