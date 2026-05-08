const axios = require('axios');

exports.handler = async (event) => {
    const YT_KEY = process.env.YT_API_KEY;
    const GEMINI_KEY = process.env.GEMINI_API_KEY;

    if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

    try {
        const { url } = JSON.parse(event.body);
        let videoId = "";
        if(url.includes("v=")) videoId = url.split("v=")[1].split("&")[0];
        else if(url.includes("shorts/")) videoId = url.split("shorts/").pop().split("?")[0];
        else if(url.includes("be/")) videoId = url.split("be/")[1].split("?")[0];

        // 1. YouTube Data Fetch
        const ytRes = await axios.get(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${YT_KEY}`);
        if(!ytRes.data.items.length) return { statusCode: 404, body: JSON.stringify({ error: "Video nahi mili" }) };
        
        const video = ytRes.data.items[0].snippet;
        let aiTags = video.tags ? video.tags.join(", ") : "Viral, Trending, SEO";
        let aiDesc = "🚀 SEO Optimized: " + video.title;

        // 2. Gemini AI Call (Try-Catch ke saath taaki tool crash na ho)
        try {
            const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;
            const aiRes = await axios.post(geminiUrl, {
                contents: [{ parts: [{ text: `Write viral tags and SEO description for: ${video.title}` }] }]
            });
            aiDesc = aiRes.data.candidates[0].content.parts[0].text;
        } catch (aiErr) {
            console.log("AI Error, using YT data instead");
        }

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: video.title,
                thumbnail: video.thumbnails.high.url,
                tags: aiTags,
                hashtags: "#viral #trending #aashumalik",
                description: aiDesc
            })
        };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: "Check API Keys in Netlify" }) };
    }
};
