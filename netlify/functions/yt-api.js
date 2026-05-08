const axios = require('axios');

exports.handler = async (event) => {
    const YT_KEY = process.env.YT_API_KEY;
    const GEMINI_KEY = process.env.GEMINI_API_KEY;

    if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

    try {
        const { url } = JSON.parse(event.body);
        let videoId = "";
        if(url.includes("v=")) videoId = url.split("v=")[1].split("&")[0];
        else if(url.includes("shorts/")) videoId = url.split("shorts/")[1].split("?")[0].split("/").pop();
        else if(url.includes("be/")) videoId = url.split("be/")[1].split("?")[0];

        if(!videoId) return { statusCode: 400, body: JSON.stringify({ error: "Invalid Link" }) };

        // 1. YouTube se details lena
        const ytRes = await axios.get(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${YT_KEY}`);
        if(!ytRes.data.items.length) return { statusCode: 404, body: JSON.stringify({ error: "Video not found" }) };
        
        const video = ytRes.data.items[0].snippet;
        const title = video.title;

        // 2. Gemini AI se Viral SEO Pack banwana
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;
        const prompt = {
            contents: [{
                parts: [{
                    text: `Identify the most viral YouTube SEO elements for a video titled: "${title}". 
                    Provide: 
                    1. 15 Viral Tags (comma separated)
                    2. 10 Trending Hashtags
                    3. A high-ranking SEO Description with keywords.`
                }]
            }]
        };

        const aiRes = await axios.post(geminiUrl, prompt);
        const aiText = aiRes.data.candidates[0].content.parts[0].text;

        // Data ko alag karna (Simple splitting logic)
        const sections = aiText.split('\n');

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: title,
                thumbnail: video.thumbnails.high.url,
                tags: sections.find(s => s.toLowerCase().includes("tags")) || "Viral, Trending, SEO, " + title,
                hashtags: sections.find(s => s.toLowerCase().includes("hashtag")) || "#viral #trending",
                description: aiText
            })
        };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: "AI Connection Failed" }) };
    }
};
