const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All vehicle routes require authentication
router.use(authenticateToken);

// ── GET /api/vehicles ──────────────────────────────────────────
router.get('/', (req, res) => {
  try {
    const vehicles = db.prepare(`
      SELECT * FROM vehicles WHERE user_id = ? ORDER BY created_at DESC
    `).all(req.user.id);

    res.json(vehicles.map(v => ({
      id: v.id,
      userId: v.user_id,
      modelName: v.model_name,
      manufacturer: v.manufacturer,
      batteryCapacity: v.battery_capacity,
      baseEfficiency: v.base_efficiency,
      learnedEfficiency: v.learned_efficiency,
      degradationFactor: v.degradation_factor,
      totalTrips: v.total_trips,
      totalDistance: v.total_distance,
      createdAt: v.created_at,
      // Also map to the frontend EVModel shape
      name: v.model_name,
      range: Math.round(v.battery_capacity / v.learned_efficiency * 1000),
      efficiency: v.learned_efficiency / 1000,
    })));
  } catch (err) {
    console.error('Get vehicles error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── POST /api/vehicles ─────────────────────────────────────────
router.post('/', (req, res) => {
  try {
    const { modelName, manufacturer, batteryCapacity, baseEfficiency, evModelId } = req.body;

    let name = modelName;
    let mfr = manufacturer;
    let capacity = batteryCapacity;
    let efficiency = baseEfficiency;

    // If evModelId is provided, pull specs from the catalog
    if (evModelId) {
      const catalog = db.prepare('SELECT * FROM ev_models WHERE id = ?').get(evModelId);
      if (catalog) {
        name = name || catalog.name;
        mfr = mfr || catalog.manufacturer;
        capacity = capacity || catalog.battery_capacity;
        efficiency = efficiency || catalog.efficiency;
      }
    }

    if (!name || !mfr || !capacity || !efficiency) {
      return res.status(400).json({ error: 'modelName, manufacturer, batteryCapacity, and baseEfficiency are required' });
    }

    const id = uuidv4();

    db.prepare(`
      INSERT INTO vehicles (id, user_id, model_name, manufacturer, battery_capacity, base_efficiency, learned_efficiency)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, req.user.id, name, mfr, capacity, efficiency, efficiency); // learned starts at base

    const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(id);

    res.status(201).json({
      id: vehicle.id,
      userId: vehicle.user_id,
      modelName: vehicle.model_name,
      manufacturer: vehicle.manufacturer,
      batteryCapacity: vehicle.battery_capacity,
      baseEfficiency: vehicle.base_efficiency,
      learnedEfficiency: vehicle.learned_efficiency,
      degradationFactor: vehicle.degradation_factor,
      totalTrips: vehicle.total_trips,
      totalDistance: vehicle.total_distance,
      name: vehicle.model_name,
      range: Math.round(vehicle.battery_capacity / vehicle.learned_efficiency * 1000),
      efficiency: vehicle.learned_efficiency / 1000,
    });
  } catch (err) {
    console.error('Create vehicle error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── PUT /api/vehicles/:id ──────────────────────────────────────
router.put('/:id', (req, res) => {
  try {
    const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.user.id);

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const { modelName, manufacturer, batteryCapacity, baseEfficiency } = req.body;

    db.prepare(`
      UPDATE vehicles
      SET model_name = COALESCE(?, model_name),
          manufacturer = COALESCE(?, manufacturer),
          battery_capacity = COALESCE(?, battery_capacity),
          base_efficiency = COALESCE(?, base_efficiency)
      WHERE id = ? AND user_id = ?
    `).run(
      modelName || null, manufacturer || null,
      batteryCapacity || null, baseEfficiency || null,
      req.params.id, req.user.id
    );

    const updated = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    console.error('Update vehicle error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── DELETE /api/vehicles/:id ───────────────────────────────────
router.delete('/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM vehicles WHERE id = ? AND user_id = ?')
      .run(req.params.id, req.user.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    res.json({ message: 'Vehicle deleted' });
  } catch (err) {
    console.error('Delete vehicle error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
