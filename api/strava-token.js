// api/strava-token.js — Función Vercel (GRATIS)
// Intercambia el código OAuth de Strava por un access_token
// El CLIENT_SECRET nunca sale del servidor.

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const code         = req.method === 'GET'  ? req.query.code         : req.body?.code;
  const refreshToken = req.method === 'POST' ? req.body?.refresh_token : null;
  const grantType    = refreshToken ? 'refresh_token' : 'authorization_code';

  if (!code && !refreshToken) {
    return res.status(400).json({ error: 'Falta code o refresh_token' });
  }

  try {
    const body = {
      client_id:     process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      grant_type:    grantType,
    };
    if (grantType === 'authorization_code') body.code = code;
    else body.refresh_token = refreshToken;

    const response = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.message || 'Error de Strava' });

    // Solo enviamos al cliente lo necesario (nunca el client_secret)
    return res.status(200).json({
      access_token:  data.access_token,
      refresh_token: data.refresh_token,
      expires_at:    data.expires_at,
      athlete: {
        id:        data.athlete?.id,
        firstname: data.athlete?.firstname,
        lastname:  data.athlete?.lastname,
        profile:   data.athlete?.profile,
      },
    });
  } catch (err) {
    console.error('strava-token error:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
