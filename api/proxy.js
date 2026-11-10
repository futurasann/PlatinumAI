module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const API_KEY = process.env.API_KEY;
  const UPSTREAM_URL = (process.env.UPSTREAM_URL || 'https://platinum.futuramobile25.workers.dev').replace(/\/+$/, '');

  if (!API_KEY) {
    return res.status(500).json({ error: { message: 'API_KEY belum diset di Environment Variables Vercel.' } });
  }

  const pathParam = req.query.path;
  let endpoint = pathParam
    ? (Array.isArray(pathParam) ? pathParam.join('/') : pathParam)
    : '';
  endpoint = '/' + endpoint.replace(/^\/+/, '');

  const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
  const body = hasBody
    ? (typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {}))
    : undefined;

  try {
    const response = await fetch(`${UPSTREAM_URL}${endpoint}`, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body
    });

    const text = await response.text();
    try {
      return res.status(response.status).json(JSON.parse(text));
    } catch (_) {
      return res.status(502).json({
        error: {
          message: `Upstream (${UPSTREAM_URL}${endpoint}) mengembalikan non-JSON, status ${response.status}: ${text.replace(/\s+/g, ' ').slice(0, 160)}`
        }
      });
    }
  } catch (error) {
    return res.status(502).json({ error: { message: 'Gagal menghubungi upstream: ' + error.message } });
  }
};
