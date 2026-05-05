require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ──────────────────────────────────────────────────
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(`${req.method} ${req.path} → ${res.statusCode} (${ms}ms)`);
  });
  next();
});

// ── API Routes ─────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/vehicles', require('./routes/vehicles'));
app.use('/api/ev-models', require('./routes/evModels'));
app.use('/api/trips', require('./routes/trips'));
app.use('/api/preferences', require('./routes/preferences'));
app.use('/api/analytics', require('./routes/analytics'));

// ── Health Check ───────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// ── API 404 Handler ────────────────────────────────────────────
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

// ── Serve Frontend (Production) ────────────────────────────────
// Docker: ./public | Render: ../dist
const fs = require('fs');
const publicPath = fs.existsSync(path.join(__dirname, 'public', 'index.html'))
  ? path.join(__dirname, 'public')
  : path.join(__dirname, '..', 'dist');
app.use(express.static(publicPath));

// SPA fallback — all non-API routes serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// ── Seed Data ──────────────────────────────────────────────────
const { seedEVModels } = require('./seed');
seedEVModels();

// ── Start Server ───────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n⚡ EV Guide AI running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   EV Models: http://localhost:${PORT}/api/ev-models`);
  console.log(`   Mode: ${process.env.NODE_ENV || 'development'}\n`);
});
