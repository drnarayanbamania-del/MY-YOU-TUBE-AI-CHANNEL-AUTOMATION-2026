# 🎬 Video Package — Google का SECRET AI Project

## 🚀 Quick Start — Auto Generate Voiceover

### Step 0: Setup Sarvam AI
1. Go to [https://dashboard.sarvam.ai/](https://dashboard.sarvam.ai/) and sign up (free credits available!)
2. Create a new project and copy your API key
3. Create a `.env` file (copy from `.env.example`):
   ```
   SARVAM_API_KEY=your_actual_api_key_here
   ```

### Step 1: Generate Voiceover with Sarvam AI 🎙️
```powershell
# Set your API key
$env:SARVAM_API_KEY = "your-api-key-here"

# Run the voiceover generator
node generate_voiceover.js
```

This will generate:
- `voiceover_final.wav` — Full merged voiceover (~70 seconds)
- `voiceover_scene_1_hook.wav` through `voiceover_scene_7_cta.wav` — Individual scene audio

**Voice Model:** Sarvam AI Bulbul v3 | **Voice:** Shubh (Male, Conversational Hindi)

#### 🎤 Available Hindi Voices (Bulbul v3)
| Voice | Style | Best For |
|-------|-------|----------|
| **Shubh** (default) | Male, Conversational | YouTube narration, storytelling |
| **Manan** | Male, Conversational | Warm, friendly content |
| **Shreya** | Female, News | Authoritative, clear content |
| **Ishita** | Female, Entertainment | Energetic, fast-paced content |
| **Aditya** | Male, Neutral | Professional, formal content |
| **Ritu** | Female, Friendly | Approachable, educational content |

To change voice, edit `CONFIG.SPEAKER` in `generate_voiceover.js`.

### Step 2: Generate Scene Images
Use the AI image prompts from `scenes.json` with Midjourney, DALL-E 3, or Flux to generate 7 scene visuals.

### Step 3: Edit Video
- Import `voiceover_final.wav` audio
- Add scene images with Ken Burns (zoom/pan) effects
- Apply camera movements as described in `scenes.json`
- Add transitions (fade, dissolve, glitch)
- Import `subtitles.srt` for captions

### Step 4: Create Thumbnail
- Use `thumbnail.png` as base
- Add text overlay: "Google का SECRET 😱" in bold yellow
- Add "🔴 EXPOSED" badge

### Step 5: Upload to YouTube
- Copy title, description, and tags from `metadata.json`
- Set category to "Science & Technology"
- Pin the comment from metadata
- Best time: Sunday 11:00 AM IST

## 📂 Files

| File | Purpose |
|------|---------|
| `generate_voiceover.js` | 🎙️ Sarvam AI TTS voiceover generator |
| `.env.example` | 🔑 API key template |
| `script.txt` | 📝 Voiceover narration script |
| `subtitles.srt` | 📜 SRT subtitle file |
| `scenes.json` | 🎬 Scene breakdown + AI prompts |
| `metadata.json` | 📋 YouTube upload metadata |
| `thumbnail.png` | 🖼️ Base thumbnail image |

## 🎵 Video Specs
- **Duration:** ~70 seconds
- **Resolution:** 1920x1080 (1080p)
- **Aspect Ratio:** 16:9
- **Frame Rate:** 30fps
- **Audio:** Hindi voiceover (Sarvam AI Bulbul v3) + background music
- **Voice:** Shubh (Male, Conversational, Hindi)

---
Generated on: 2026-03-08 | Powered by Sarvam AI Bulbul v3
