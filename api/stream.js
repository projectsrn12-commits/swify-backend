import ytdl from "ytdl-core";

export const config = { api: { responseLimit: false } };

export default async function handler(req, res) {
  try {
    let { url } = req.query;

    if (!url) return res.status(400).send("Missing URL");

    url = decodeURIComponent(url);

    // Always remove ?si= etc
    url = url.split("?")[0];

    if (!ytdl.validateURL(url)) {
      return res.status(400).send("Invalid YouTube URL");
    }

    const info = await ytdl.getInfo(url);
    const format = ytdl.chooseFormat(info.formats, {
      quality: "highestaudio",
      filter: "audioonly",
    });

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Accept-Ranges", "bytes");

    const stream = ytdl.downloadFromInfo(info, {
      format,
      highWaterMark: 1024 * 512, // lower size for vercel streams
    });

    stream.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error streaming audio");
  }
}
