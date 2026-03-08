const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const readline = require('readline');
const { CHANNEL_NAME, CHANNEL_URL, VIDEO_NICHE, TAGS, HASHTAGS } = require('./niche_config.js');

// ==========================================
// ⚙️ YOUTUBE API SETTINGS
// ==========================================
// IMPORTANT: You need to create credentials on Google Cloud Console:
// 1. Go to https://console.cloud.google.com/
// 2. Create a new project, enable "YouTube Data API v3"
// 3. Create OAuth 2.0 Client IDs (Desktop App)
// 4. Download JSON, rename to "client_secret.json" and place here!

const CREDENTIALS_PATH = path.join(__dirname, 'client_secret.json');
const TOKEN_PATH = path.join(__dirname, 'youtube_token.json');
const SCOPES = ['https://www.googleapis.com/auth/youtube.upload'];

// Try to load video content
const videoFileArgs = process.argv.slice(2);
const VIDEO_PATH = videoFileArgs[0] || path.join(__dirname, 'final_video.mp4');

if (!fs.existsSync(VIDEO_PATH)) {
    console.error(`❌ Video file not found: ${VIDEO_PATH}`);
    console.log('Provide the path to your video as an argument:');
    console.log('node upload_to_youtube.js my_video.mp4');
    process.exit(1);
}

// Generate Default Description from config
const description = `${VIDEO_NICHE}

क्या हम इंसान दुनिया की सबसे smart species बने रहेंगे? या फिर AGI (Artificial General Intelligence) हमारी जगह ले लेगा? ${CHANNEL_NAME} के इस video में हम बात करेंगे future of AI के सबसे बड़े खतरे और चमत्कार — AGI के बारे में।

वीडियो को अंत तक देखें क्योंकि AGI का सच आपके होश उड़ा देगा! अगर आपको Artificial Intelligence, future technology, और science mysteries में interest है, तो ${CHANNEL_NAME} channel को SUBSCRIBE करना ना भूलें।
🔗 Subscribe Here: ${CHANNEL_URL ? CHANNEL_URL : ''}

${HASHTAGS.join(' ')}`;

// ==========================================
// 🔐 AUTHENTICATION
// ==========================================
fs.readFile(CREDENTIALS_PATH, (err, content) => {
    if (err) {
        console.log('❌ Error loading client secret file:', err.message);
        console.log('Make sure you have downloaded "client_secret.json" from Google Cloud Console as instructed in the script.');
        return;
    }
    authorize(JSON.parse(content), uploadVideo);
});

function authorize(credentials, callback) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getNewToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    });
}

function getNewToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({ access_type: 'offline', scope: SCOPES });
    console.log('============================================');
    console.log('🔐 AUTHORIZE YOUTUBE UPLOAD');
    console.log('============================================');
    console.log('Authorize this app by visiting this url:\n\n', authUrl, '\n');
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('✅ Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}

// ==========================================
// 🚀 UPLOAD VIDEO
// ==========================================
function uploadVideo(auth) {
    const youtube = google.youtube({ version: 'v3', auth });
    
    console.log('\n============================================');
    console.log(`📤 UPLOADING VIDEO: ${VIDEO_PATH}`);
    console.log('============================================');
    
    const fileSize = fs.statSync(VIDEO_PATH).size;

    const req = youtube.videos.insert({
        part: 'snippet,status',
        requestBody: {
            snippet: {
                title: VIDEO_NICHE,
                description: description,
                tags: TAGS,
                categoryId: '28', // 28 = Science & Technology
                defaultLanguage: 'hi'
            },
            status: {
                privacyStatus: 'private', // Upload as private to be safe, change to 'public' when ready!
                selfDeclaredMadeForKids: false
            }
        },
        media: {
            body: fs.createReadStream(VIDEO_PATH)
        }
    }, {
        onUploadProgress: evt => {
            const progress = Math.round((evt.bytesRead / fileSize) * 100);
            if (process.stdout.isTTY) {
                process.stdout.clearLine();
                process.stdout.cursorTo(0);
                process.stdout.write(`⏳ Upload Progress: ${progress}%`);
            } else {
                // If not in a terminal (like the Web UI), only print every 5% to keep logs clean
                if (progress % 5 === 0) {
                    console.log(`⏳ Upload Progress: ${progress}%`);
                }
            }
        }
    });

    req.then((res) => {
        const now = new Date();
        const istTime = now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'full', timeStyle: 'medium' });
        
        console.log('\n');
        console.log('╔════════════════════════════════════════════╗');
        console.log('║   ✅ VIDEO UPLOADED SUCCESSFULLY! 🎉       ║');
        console.log('╠════════════════════════════════════════════╣');
        console.log(`║  📅 Upload Date : ${istTime}`);
        console.log(`║  🔗 Video URL   : https://youtube.com/watch?v=${res.data.id}`);
        console.log(`║  🎬 Video Title : ${res.data.snippet?.title || VIDEO_NICHE}`);
        console.log(`║  🔒 Status      : ${res.data.status?.privacyStatus || 'private'}`);
        console.log(`║  📊 Video ID    : ${res.data.id}`);
        console.log('╠════════════════════════════════════════════╣');
        console.log('║  ⏳ YouTube is processing your video...     ║');
        console.log('║  It may take 5-15 minutes to appear.       ║');
        console.log('╚════════════════════════════════════════════╝');
    }).catch((err) => {
        const now = new Date();
        const istTime = now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'full', timeStyle: 'medium' });
        
        console.error('\n\n❌ UPLOAD FAILED!');
        console.error(`📅 Time: ${istTime}`);
        console.error(`❌ Error: ${err.message}`);
        if (err.message.includes('quota')) {
            console.error('💡 Tip: YouTube API has a daily quota limit. Try again tomorrow.');
        }
    });
}
