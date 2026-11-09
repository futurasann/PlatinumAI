// proxy.js untuk Vercel (api/proxy.js atau pages/api/chat.js)
// Environment Variables di Vercel: API_KEY dan BASE_URL

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const API_KEY = process.env.API_KEY;
    const BASE_URL = process.env.BASE_URL || "https://tokenmurah.net/v1";

    if (!API_KEY) {
      return res.status(500).json({ error: "API_KEY belum di-set di Vercel Environment Variables" });
    }

    const response = await fetch(`${BASE_URL.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
