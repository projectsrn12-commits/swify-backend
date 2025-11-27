export default function handler(req, res) {
  return res.json({
    received_url: req.query.url,
    full_query: req.query
  });
}
