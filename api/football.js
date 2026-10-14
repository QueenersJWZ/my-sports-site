// api/football.js
// Vercel Serverless Function：代理 football-data.org 请求，解决 CORS
export default async function handler(req, res) {
  // 允许你的网站访问这个 API
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { competition, dateFrom, dateTo, type } = req.query;
  const token = process.env.FOOTBALL_DATA_TOKEN;

  if (!token) {
    return res.status(500).json({ error: 'FOOTBALL_DATA_TOKEN 未配置' });
  }

  if (!competition) {
    return res.status(400).json({ error: '缺少 competition 参数' });
  }

  try {
    let url;
    if (type === 'standings') {
      url = `https://api.football-data.org/v4/competitions/${competition}/standings`;
    } else {
      url = `https://api.football-data.org/v4/competitions/${competition}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`;
    }

    const response = await fetch(url, {
      headers: { 'X-Auth-Token': token },
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('代理请求失败:', error);
    return res.status(500).json({ error: '请求 football-data.org 失败' });
  }
}
