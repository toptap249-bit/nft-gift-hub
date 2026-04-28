require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');
const apiRoutes = require('./api');
const { startBot } = require('./bot');

const app = express();
const PORT = Number(process.env.PORT || 3000);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve frontend (index.html lives in same dir as server.js)
const FRONTEND_DIR = __dirname;
app.use(express.static(FRONTEND_DIR));

// API
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// SPA fallback for unknown non-/api routes — serve index.html
app.get(/^(?!\/api\/).*/, (req, res, next) => {
  if (req.method !== 'GET') return next();
  res.sendFile(path.join(FRONTEND_DIR, 'index.html'), (err) => {
    if (err) next(err);
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

async function maybeStartNgrok() {
  // Hosted deployment (Render auto-sets RENDER_EXTERNAL_URL,
  // user can also set WEBAPP_URL manually for any host).
  if (process.env.WEBAPP_URL) return process.env.WEBAPP_URL;
  if (process.env.RENDER_EXTERNAL_URL) return process.env.RENDER_EXTERNAL_URL;

  const token = process.env.NGROK_AUTHTOKEN;
  if (!token) return null;

  const ngrok = require('@ngrok/ngrok');
  console.log('🌐 Запускаю ngrok-туннель...');
  try {
    const listener = await ngrok.connect({ addr: PORT, authtoken: token });
    const url = listener.url();
    console.log(`🌐 Публичный URL: ${url}`);
    return url;
  } catch (err) {
    console.error('❌ ngrok ошибка:', err.message);
    return null;
  }
}

app.listen(PORT, async () => {
  console.log(`\n🚀 NFT Gift Hub backend: http://localhost:${PORT}`);
  console.log(`📱 Открой этот URL в браузере для демо-режима\n`);

  const webAppUrl = await maybeStartNgrok();

  startBot({
    token: process.env.TELEGRAM_BOT_TOKEN,
    webAppUrl: webAppUrl || process.env.WEBAPP_URL,
  });
});
