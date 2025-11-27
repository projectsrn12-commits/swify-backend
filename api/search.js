import YouTube from "youtube-sr";

export default async function handler(req, res) {
  const { q } = req.query;

  if (!q) return res.status(400).json({ error: "Missing query parameter 'q'" });

  try {
    // Refine query to prioritize music and filter for videos only
    const results = await YouTube.search(`${q} song`, {
      limit: 50,
      type: "video",
    });

    // minimal data to send to client
    const mapped = results.map((r) => ({
      id: r.id,
      title: r.title,
      url: r.url,
      thumbnail: r.thumbnail?.url || null,
      duration: r.durationFormatted || r.duration,
      channel: r.channel ? { id: r.channel.id, name: r.channel.name } : null,
    }));

    res.status(200).json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Search failed" });
  }
}
