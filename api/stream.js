// api/stream.js
const ytdl = require('ytdl-core');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json()); // To parse JSON body

// Vercel serverless function route
app.post('/', async (req, res) => {
    // We expect the YouTube URL/ID in the POST request body
    const { url } = req.body; 

    if (!url || !ytdl.validateURL(url)) {
        return res.status(400).json({ 
            status: 'error', 
            message: 'Invalid or missing YouTube URL/ID in request body.' 
        });
    }

    try {
        // Find the best audio-only format
        const info = await ytdl.getInfo(url);
        
        const audioFormat = ytdl.chooseFormat(info.formats, { 
            quality: 'highestaudio', 
            filter: 'audioonly' 
        });

        if (!audioFormat || !audioFormat.url) {
            return res.status(500).json({ 
                status: 'error', 
                message: 'Could not find a suitable audio stream format.' 
            });
        }
        
        // Return the direct, time-sensitive stream URL along with metadata
        res.status(200).json({
            status: 'success',
            stream_url: audioFormat.url,
            title: info.videoDetails.title,
            artist: info.videoDetails.author.name,
            thumbnail: info.videoDetails.thumbnails[0].url || null,
        });

    } catch (error) {
        console.error('Stream Extraction Error:', error);
        res.status(500).json({ 
            status: 'error', 
            message: `Failed to process YouTube link: ${error.message}` 
        });
    }
});

module.exports = app;