const axios = require('axios');

module.exports = async (req, res) => {
    // CORS Permission
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const YT_KEY = process.env.YT_API_KEY;
    const GEMINI_KEY = process.env.GEMINI_API_KEY;

    try {
        const { url, topic } = req.body;
        let title = topic || "SEO Research";
        let thumb = "AASHU_MALIK.jpg";
        let prompt = `Provide 20 viral tags and a YouTube SEO description for: ${topic}`;

        if (url && url.includes('yout')) {
            const videoId = url.includes('v=') ? url.split('v=')[1].split('&')[0] : url.split('/').pop().split('?')[0];
            const ytRes = await axios.get(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${YT_KEY}`);
            if (ytRes.data.items.length > 0) {
                title = ytRes.data.items[0].snippet.title;
                thumb = ytRes.data.items[0].snippet.thumbnails.high.url;
                prompt = `Generate viral tags and SEO description for this video: ${title}`;
            }
        }

        const aiRes = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, {
            contents: [{ parts: [{ text: prompt }] }]
        });

        res.status(200).json({
            title: title,
            thumbnail: thumb,
            aiData: aiRes.data.candidates[0].content.parts[0].text
        });
    } catch (err) {
        res.status(500).json({ error: "API Key Error! Please check Vercel Env Variables." });
    }
};

