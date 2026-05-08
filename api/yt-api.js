const axios = require('axios');

module.exports = async (req, res) => {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const YT_KEY = process.env.YT_API_KEY;
    const GEMINI_KEY = process.env.GEMINI_API_KEY;

    try {
        const { url, topic } = req.body;
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;
        
        let promptText = "";
        let videoData = { title: "Aashu Malik SEO Research", thumb: "AASHU_MALIK.jpg" };

        if (topic) {
            promptText = `Act as YouTube SEO Expert. For topic "${topic}", give 5 viral titles, 20 tags (comma separated), and 10 hashtags.`;
        } else if (url) {
            let videoId = url.includes("v=") ? url.split("v=")[1].split("&")[0] : url.split("/").pop().split("?")[0];
            const ytRes = await axios.get(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${YT_KEY}`);
            const video = ytRes.data.items[0].snippet;
            videoData.title = video.title;
            videoData.thumb = video.thumbnails.high.url;
            promptText = `Generate 20 viral tags, 15 hashtags, and a pro SEO description for: ${video.title}`;
        }

        const aiRes = await axios.post(geminiUrl, { contents: [{ parts: [{ text: promptText }] }] });
        const aiData = aiRes.data.candidates[0].content.parts[0].text;

        res.status(200).json({ title: videoData.title, thumbnail: videoData.thumb, aiData: aiData });
    } catch (error) {
        res.status(500).json({ error: "Backend error! Check Vercel Keys." });
    }
};

