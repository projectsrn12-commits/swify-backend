// api/stream.js
import ytdl from 'ytdl-core';

export const config = {
  api: {
    responseLimit: false, // Disable size limit for streaming
  },
};

export default async function handler(req, res) {
  try {
    let { url, type } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'No URL provided' });
    }

    // Convert youtu.be short URL to full URL
    if (url.includes('youtu.be')) {
      const videoId = url.split('/').pop();
      url = `https://www.youtube.com/watch?v=${videoId}`;
    }

    // Validate the URL
    if (!ytdl.validateURL(url)) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    // Default type is audio
    type = type || 'audio';

    // Set headers and stream
    if (type === 'audio') {
      res.setHeader('Content-Type', 'audio/mpeg');
      ytdl(url, { filter: 'audioonly', highWaterMark: 1 << 25 }).pipe(res);
    } else if (type === 'video') {
      res.setHeader('Content-Type', 'video/mp4');
      ytdl(url, { quality: 'highest', highWaterMark: 1 << 25 }).pipe(res);
    } else {
      return res.status(400).json({ error: 'Invalid type. Use audio or video.' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to stream video/audio', details: err.message });
  }
}
