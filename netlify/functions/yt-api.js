const { Groq } = require("groq-sdk");
const axios = require("axios");

// Groq Setup
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

exports.handler = async (event, context) => {
    // Sirf POST requests allow karne ke liye
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        const { url } = JSON.parse(event.body);
        
        // 1. YouTube Video ID nikaalna
        const videoIdMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/|.*embed\/|.*shorts\/))([^?&|#]+)/);
        if (!videoIdMatch) {
            return { statusCode: 400, body: JSON.stringify({ error: "Invalid YouTube URL" }) };
        }
        const videoId = videoIdMatch[1];

        // 2. No-API Hack: Video Title fetch karna (Unlisted ke liye bhi kaam karega)
        // Hum oembed ka use kar rahe hain kyunki isme API key nahi chahiye hoti
        const embedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
        const ytResponse = await axios.get(embedUrl);
        const videoTitle = ytResponse.data.title;
        const thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

        // 3. Groq AI se Viral SEO Data generate karwana
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a YouTube Viral SEO Expert. Always respond in valid JSON format."
                },
                {
                    role: "user",
                    content: `Analyze this video title: "${videoTitle}". 
                    Provide the following for a viral video:
                    1. "tags": 20 viral tags as a single comma-separated string.
                    2. "keywords": 15 high-volume trending keywords.
                    3. "hashtags": 10 trending hashtags starting with #.
                    4. "description": A high-ranking SEO description (minimum 150 words) including a welcome note, video summary, and keywords.
                    
                    Respond ONLY with a JSON object.`
                },
            ],
            model: "llama3-8b-8192",
            response_format: { type: "json_object" },
        });

        const aiData = JSON.parse(completion.choices[0].message.content);

        // 4. Final Response bhejra
        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                success: true,
                title: videoTitle,
                thumbnail: thumbnail,
                tags: aiData.tags,
                keywords: aiData.keywords,
                hashtags: aiData.hashtags,
                description: aiData.description
            }),
        };

    } catch (error) {
        console.error("Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Server Error: AI data fetch nahi ho paya", details: error.message }),
        };
    }
};
