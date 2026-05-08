const yt_dlp = require('yt-dlp-exec');

exports.handler = async (event) => {
    if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };
    
    try {
        const { url } = JSON.parse(event.body);
        const output = await yt_dlp(url, {
            dumpSingleJson: true,
            noCheckCertificates: true,
            preferFreeFormats: true
        });

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: output.title,
                thumbnail: output.thumbnail
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "API Error" })
        };
    }
};

