const axios = require('axios');

exports.handler = async (event) => {
    const API_KEY = process.env.YT_API_KEY; 
    if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

    try {
        const { url } = JSON.parse(event.body);
        let videoId = "";
        if(url.includes("v=")) videoId = url.split("v=")[1].split("&")[0];
        else if(url.includes("shorts/")) videoId = url.split("shorts/")[1].split("?")[0];
        else if(url.includes("be/")) videoId = url.split("be/")[1].split("?")[0];

        // YouTube API se full snippet lena
        const response = await axios.get(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${API_KEY}`);
        const video = response.data.items[0].snippet;

        // Viral logic: Tags aur Description se keywords nikalna
        const tags = video.tags ? video.tags.join(", ") : "Viral, Trending, YouTube SEO";
        const hashtags = video.description.match(/#\w+/g) ? video.description.match(/#\w+/g).join(" ") : "#viral #trending #seo";

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: video.title,
                thumbnail: video.thumbnails.high.url,
                tags: tags,
                hashtags: hashtags,
                description: "🔥 Viral SEO Description: \n" + video.title + " is trending now! Check out these viral insights. \n\n" + video.description.substring(0, 150) + "..."
            })
        };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: "SEO Data Fetch Failed" }) };
    }
};
