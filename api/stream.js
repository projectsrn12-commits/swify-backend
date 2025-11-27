// api/stream.js
import ytdl from "ytdl-core";

export const config = { api: { responseLimit: false } };

export default async function handler(req, res) {
  let { url } = req.query;

  if (!url) return res.status(400).send("Missing URL");

  // Remove extra params like ?si=…
  url = url.split("?")[0];

  if (!ytdl.validateURL(url)) return res.status(400).send("Invalid YouTube URL");

  res.setHeader("Content-Type", "audio/mpeg");
  res.setHeader("Transfer-Encoding", "chunked");

  const stream = ytdl(url, {
    filter: "audioonly",
    quality: "highestaudio",
    highWaterMark: 1 << 25,
  });

  stream.on("error", (err) => {
    console.error(err);
    return res.status(500).send("Stream error");
  });

  stream.pipe(res);
}
