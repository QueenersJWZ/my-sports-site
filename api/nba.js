// api/nba.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { dates, stats, seasons } = req.query;
  const apiKey = process.env.BALLDONTLIE_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'BALLDONTLIE_KEY 未配置' });
  }

  try {
    let url;
    if (stats === 'true') {
      url = `https://api.balldontlie.io/v1/stats?seasons[]=${seasons}&per_page=20`;
    } else {
      url = `https://api.balldontlie.io/v1/games?dates[]=${dates}&per_page=100`;
    }

    const response = await fetch(url, {
      headers: { Authorization: apiKey },
    });
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('NBA 代理失败:', error);
    return res.status(500).json({ error: 'NBA proxy failed' });
  }
}
