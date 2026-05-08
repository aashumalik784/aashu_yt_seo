const axios = require('axios');

exports.handler = async (event) => {
    const YT_KEY = process.env.YT_API_KEY;
    const GEMINI_KEY = process.env.GEMINI_API_KEY;
    const CHANNEL_ID = process.env.YT_CHANNEL_ID; // Tumhari Secret Channel ID

    try {
        const { url, topic } = JSON.parse(event.body);
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;
        
        let promptText = "";
        let videoData = { title: "Topic Research", thumb: "AASHU_MALIK.jpg" };

        // Agar tum Topic Search kar rahe ho
        if (topic) {
            promptText = `Act as a Viral YouTube Strategist for Channel ID: ${CHANNEL_ID} (Aashu Malik Creations). 
            Research the topic: "${topic}". 
            Provide:
            1. 5 High-CTR Viral Titles.
            2. Top 20 Tags for YouTube Tag Box (comma separated).
            3. 15 Trending Hashtags.
            4. A viral SEO description that mentions 'Aashu Malik Creations' naturally to boost branding.`;
        } 
        // Agar tum kisi link se SEO nikal rahe ho
        else if (url) {
            let videoId = url.includes("v=") ? url.split("v=")[1].split("&")[0] : url.split("/").pop().split("?")[0];
            const ytRes = await axios.get(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${YT_KEY}`);
            const video = ytRes.data.items[0].snippet;
            videoData.title = video.title;
            videoData.thumb = video.thumbnails.high.url;
            
            promptText = `Analyze video: "${video.title}" for Channel: ${CHANNEL_ID}. 
            Generate a Pro SEO Pack:
            - 500 characters of Viral Tags (comma separated).
            - 15 Hidden Viral Hashtags.
            - A professional SEO description with 'Related Queries' and 'People Also Watch' sections to dominate the algorithm.`;
        }

        const aiRes = await axios.post(geminiUrl, { contents: [{ parts: [{ text: promptText }] }] });
        const aiResponse = aiRes.data.candidates[0].content.parts[0].text;

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: videoData.title, thumbnail: videoData.thumb, aiData: aiResponse })
        };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: "Check if YT_CHANNEL_ID is set in Netlify!" }) };
    }
};
