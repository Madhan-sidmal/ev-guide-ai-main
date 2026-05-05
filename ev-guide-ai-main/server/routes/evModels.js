const express = require('express');
const db = require('../db');

const router = express.Router();

// ── GET /api/ev-models ─────────────────────────────────────────
// Public — no auth required. Returns the seed catalog.
router.get('/', (req, res) => {
  try {
    const models = db.prepare('SELECT * FROM ev_models ORDER BY manufacturer, name').all();

    res.json(models.map(m => ({
      id: m.id,
      name: m.name,
      manufacturer: m.manufacturer,
      batteryCapacity: m.battery_capacity,
      range: m.range_km,
      efficiency: m.efficiency / 1000, // Wh/km → kWh/km for frontend
    })));
  } catch (err) {
    console.error('Get EV models error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
