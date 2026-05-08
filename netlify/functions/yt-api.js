const axios = require('axios');

exports.handler = async (event) => {
    if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };
    
    try {
        const { url } = JSON.parse(event.body);
        
        // YouTube oEmbed API ka use kar rahe hain jo fast aur reliable hai
        const response = await axios.get(`https://www.youtube.com/oembed?url=${url}&format=json`);
        const data = response.data;

        return {
            statusCode: 200,
            headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*" 
            },
            body: JSON.stringify({
                title: data.title,
                thumbnail: data.thumbnail_url
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Video data not found or invalid link" })
        };
    }
};
