const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { google } = require('googleapis');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(path.join(__dirname)));
app.use(express.json());

// Run the full automation bot
app.post('/api/run-automation', (req, res) => {
    const { sarvamKey, geminiKey, openaiKey } = req.body;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    console.log("🚀 Starting Full Automation Bot (Driverless Tesla Mode)...");
    
    // Spawn the auto_channel.js script with provided keys
    const child = spawn('node', ['auto_channel.js'], { 
        cwd: __dirname,
        env: { 
            ...process.env, 
            SARVAM_API_KEY: sarvamKey || process.env.SARVAM_API_KEY,
            GEMINI_API_KEY: geminiKey || process.env.GEMINI_API_KEY,
            OPENAI_API_KEY: openaiKey || process.env.OPENAI_API_KEY
        }
    });

    child.stdout.on('data', (data) => {
        process.stdout.write(data);
        res.write(data);
    });

    child.stderr.on('data', (data) => {
        process.stderr.write(data);
        res.write(data);
    });

    child.on('close', (code) => {
        console.log(`Automation process exited with code ${code}`);
        res.write(`\n[DONE] Process finished with exit code: ${code}\n`);
        res.end();
    });
});

// Proxy for Sarvam AI TTS (Fixes CORS issues)
app.post('/api/proxy-tts', async (req, res) => {
    try {
        const apiKey = req.headers['api-subscription-key'];
        if (!apiKey) return res.status(401).send('Missing API Key');

        const response = await fetch('https://api.sarvam.ai/text-to-speech', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'api-subscription-key': apiKey 
            },
            body: JSON.stringify(req.body)
        });

        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        console.error('Proxy Error:', error);
        res.status(500).send('Error connecting to Sarvam AI');
    }
});

// Create and Download ZIP Package
app.get('/api/download-zip', (req, res) => {
    const zipName = 'youtube_video_package.zip';
    const zipPath = path.join(__dirname, zipName);
    
    // Use Linux-compatible zip command (standard on Render/Linux)
    // Items: final_video.mp4, voiceover_final.wav, niche_config.js, agi_scenes directory, agi_thumbnail.png
    const zipCommand = `zip -r "${zipPath}" final_video.mp4 voiceover_final.wav niche_config.js agi_scenes agi_thumbnail.png`;

    const { exec } = require('child_process');
    exec(zipCommand, (error) => {
        if (error) {
            console.error('ZIP Error:', error);
            // Fallback: If zip is not installed, try simple file send or error
            return res.status(500).send('Error creating ZIP (Ensure "zip" is installed on server)');
        }

        res.download(zipPath, zipName, (err) => {
            if (err) console.error('Download Error:', err);
            // Delete the zip after sending
            if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
        });
    });
});

// ==========================================
// 🔐 REMOTE YOUTUBE AUTHENTICATION
// ==========================================
const CREDENTIALS_PATH = path.join(__dirname, 'client_secret.json');
const TOKEN_PATH = path.join(__dirname, 'youtube_token.json');
const SCOPES = ['https://www.googleapis.com/auth/youtube.upload'];

app.get('/api/youtube/auth-url', (req, res) => {
    if (!fs.existsSync(CREDENTIALS_PATH)) {
        return res.status(500).json({ error: 'client_secret.json missing on server' });
    }

    const content = fs.readFileSync(CREDENTIALS_PATH);
    const credentials = JSON.parse(content);
    const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
    const host = req.get('host');
    const protocol = req.protocol;
    const defaultRedirect = `${protocol}://${host}`;
    const redirect_uri = process.env.REDIRECT_URI || defaultRedirect;

    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uri);

    const authUrl = oAuth2Client.generateAuthUrl({ access_type: 'offline', scope: SCOPES, prompt: 'consent' });
    res.json({ url: authUrl });
});

app.post('/api/youtube/callback', async (req, res) => {
    const { code } = req.body;
    if (!code) return res.status(400).send('Missing auth code');

    const content = fs.readFileSync(CREDENTIALS_PATH);
    const credentials = JSON.parse(content);
    const host = req.get('host');
    const protocol = req.protocol;
    const defaultRedirect = `${protocol}://${host}`;
    const redirect_uri = process.env.REDIRECT_URI || defaultRedirect;

    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uri);

    try {
        const { tokens } = await oAuth2Client.getToken(code);
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
        res.json({ success: true, message: 'YouTube Token Saved Successfully!' });
    } catch (error) {
        console.error('Token Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/youtube/status', (req, res) => {
    const hasToken = fs.existsSync(TOKEN_PATH);
    res.json({ authenticated: hasToken });
});

app.listen(port, () => {
    console.log(`============================================`);
    console.log(`🚀 AI YOUTUBE UI SERVER IS RUNNING!`);
    console.log(`============================================`);
    console.log(`► Open your browser to: http://localhost:${port}`);
    console.log(`============================================`);
});
