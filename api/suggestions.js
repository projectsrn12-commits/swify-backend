export default async function handler(req, res) {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ error: "Missing query parameter 'q'" });
  }

  try {
    const suggestionsUrl = `https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(
      q
    )}`;

    const response = await fetch(suggestionsUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch suggestions: ${response.statusText}`);
    }

    const data = await response.json();
    const suggestions = data[1] || [];

    res.status(200).json(suggestions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get suggestions" });
  }
}