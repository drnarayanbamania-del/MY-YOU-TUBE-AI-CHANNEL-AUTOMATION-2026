// ==========================================
// ⚙️ YOUTUBE VIDEO PACKAGE CONFIGURATION
// You can enter your new niche details here!
// Update the arrays below when you generate a new video.
// ==========================================

const CHANNEL_NAME = "AI mdico";
const CHANNEL_URL = "https://www.youtube.com/channel/UCktdIQoSfHOwmJ1wqToROpQ";
const VIDEO_NICHE = "AGI: when AI becomes smarter than humans";

const SCENES = [
    { id:1, name:'HOOK', duration:'0-5s', text:'क्या आपको लगता है ChatGPT बहुत smart है? तो आप बहुत बड़ी गलतफहमी में हैं!', camera:'Slow push in towards the eye', img:'agi_scenes/scene_1.png', pauseMs:800 },
    { id:2, name:'INTRO', duration:'5-15s', text:'ChatGPT तो बस एक झांकी है। Asli खतरा या चमत्कार तो अब आने वाला है, जिसका नाम है AGI... यानी Artificial General Intelligence!', camera:'Drone shot circling the structure', img:'agi_scenes/scene_2.png', pauseMs:600 },
    { id:3, name:'SUPER-BRAIN', duration:'15-30s', text:'AGI कोई normal AI नहीं है। ये एक ऐसा super-brain होगा जो इंसानों से भी ज़्यादा तेज़ सोच सकेगा।', camera:'360-degree orbit', img:'agi_scenes/scene_3.png', pauseMs:500 },
    { id:4, name:'CAPABILITIES', duration:'30-45s', text:'आप कोई भी काम सोच लो—चाहे rocket science हो, कोडिंग हो, या कोई नई दवाई बनाना हो—AGI वो काम इंसानों से 1000 गुना बेहतर कर पाएगा।', camera:'Parallax pan across the holograms', img:'agi_scenes/scene_4.png', pauseMs:600 },
    { id:5, name:'TIMELINE', duration:'45-55s', text:'OpenAI और Google जैसी कंपनियां दिन-रात AGI बनाने में लगी हैं। Experts का मानना है कि 2027 तक AGI दुनिया में आ जाएगा।', camera:'Dolly forward through the numbers', img:'agi_scenes/scene_5.png', pauseMs:700 },
    { id:6, name:'EXPERT WARNING', duration:'55-65s', text:'लेकिन सवाल ये है... जब मशीनें हम इंसानों से ज़्यादा समझदार हो जाएंगी, तो क्या वो हमारी सुनेंगी? Elon Musk खुद कह चुके हैं कि AGI इंसानों के लिए सबसे बड़ा खतरा बन सकता है।', camera:'Slow tilt up from human to robot', img:'agi_scenes/scene_6.png', pauseMs:800 },
    { id:7, name:'CTA', duration:'65-75s', text:'क्या हम AGI के लिए तैयार हैं? अपनी राय comment में बताओ! और ऐसी ही mind-blowing AI updates के लिए AI mdico channel को SUBSCRIBE करो! 🔔', camera:'Quick zoom in and slight shake', img:'agi_scenes/scene_7.png', pauseMs:0 }
];

const TAGS = [
    'agi kya hai', 'artificial general intelligence hindi', 'future of ai', 
    'ai taking over the world', 'openai agi', 'agi explained in hindi', 
    'ai vs humans', 'chatgpt vs agi', 'elon musk ai warning', 'singularity ai', 
    'ai mdico channel', 'ai mdico', 'ai jobs future', 'ai news hindi 2026', 
    'kya ai khatarnak hai', 'superintelligence ai', 'tech news hindi', 
    'google agi project', 'agi arrival date', 'robot future'
];

const HASHTAGS = ['#AImdico', '#AGI', '#ArtificialIntelligence', '#FutureOfAI', '#AINewsHindi'];

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CHANNEL_NAME, CHANNEL_URL, VIDEO_NICHE, SCENES, TAGS, HASHTAGS };
}
