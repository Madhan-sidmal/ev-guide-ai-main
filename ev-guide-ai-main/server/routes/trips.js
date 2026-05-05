const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { updateVehicleEfficiency } = require('../services/learningEngine');

const router = express.Router();

// All trip routes require authentication
router.use(authenticateToken);

// ── GET /api/trips/history ─────────────────────────────────────
router.get('/history', (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const trips = db.prepare(`
      SELECT t.*, v.model_name as vehicle_name
      FROM trips t
      LEFT JOIN vehicles v ON t.vehicle_id = v.id
      WHERE t.user_id = ?
      ORDER BY t.created_at DESC
      LIMIT ? OFFSET ?
    `).all(req.user.id, parseInt(limit), parseInt(offset));

    res.json(trips.map(t => ({
      id: t.id,
      date: t.created_at,
      source: JSON.parse(t.start_location),
      destination: JSON.parse(t.end_location),
      distance: t.distance,
      batteryUsed: t.predicted_consumption,
      actualBatteryUsed: t.actual_consumption,
      evModel: t.vehicle_name || 'Unknown',
      weather: t.weather_condition || 'clear',
      carbonSaved: t.carbon_saved,
      routeType: t.route_type,
      vehicleId: t.vehicle_id,
    })));
  } catch (err) {
    console.error('Get trip history error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── POST /api/trips ────────────────────────────────────────────
// Save a completed trip. This is the data goldmine.
router.post('/', (req, res) => {
  try {
    const {
      source, destination, distance, duration,
      batteryUsed, actualConsumption, evModel,
      weather, carbonSaved, routeType, vehicleId,
    } = req.body;

    if (!source || !destination || !distance) {
      return res.status(400).json({ error: 'source, destination, and distance are required' });
    }

    const id = uuidv4();

    db.prepare(`
      INSERT INTO trips (
        id, user_id, vehicle_id, start_location, end_location,
        distance, duration, predicted_consumption, actual_consumption,
        weather_condition, route_type, carbon_saved
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      req.user.id,
      vehicleId || null,
      JSON.stringify(source),
      JSON.stringify(destination),
      distance,
      duration || null,
      batteryUsed || null,
      actualConsumption || null,
      weather || null,
      routeType || 'mixed',
      carbonSaved || distance * 0.12,
    );

    // Update vehicle stats if vehicle is linked
    if (vehicleId) {
      db.prepare(`
        UPDATE vehicles
        SET total_trips = total_trips + 1,
            total_distance = total_distance + ?
        WHERE id = ? AND user_id = ?
      `).run(distance, vehicleId, req.user.id);
    }

    // If actual consumption is provided, trigger learning
    if (vehicleId && actualConsumption && batteryUsed) {
      const learningResult = updateVehicleEfficiency(vehicleId, batteryUsed, actualConsumption);
      if (learningResult) {
        return res.status(201).json({
          id,
          message: 'Trip saved and vehicle efficiency updated',
          learning: learningResult,
        });
      }
    }

    res.status(201).json({ id, message: 'Trip saved' });
  } catch (err) {
    console.error('Save trip error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── PUT /api/trips/:id/actual ──────────────────────────────────
// Report actual consumption after trip. This triggers learning.
router.put('/:id/actual', (req, res) => {
  try {
    const { actualConsumption } = req.body;

    if (actualConsumption == null) {
      return res.status(400).json({ error: 'actualConsumption is required' });
    }

    const trip = db.prepare('SELECT * FROM trips WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.user.id);

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    // Update the trip record
    db.prepare('UPDATE trips SET actual_consumption = ? WHERE id = ?')
      .run(actualConsumption, req.params.id);

    // Trigger learning engine if vehicle is linked
    let learningResult = null;
    if (trip.vehicle_id && trip.predicted_consumption) {
      learningResult = updateVehicleEfficiency(
        trip.vehicle_id,
        trip.predicted_consumption,
        actualConsumption
      );
    }

    res.json({
      message: 'Actual consumption recorded',
      learning: learningResult,
    });
  } catch (err) {
    console.error('Update actual consumption error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── DELETE /api/trips/:id ──────────────────────────────────────
router.delete('/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM trips WHERE id = ? AND user_id = ?')
      .run(req.params.id, req.user.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    res.json({ message: 'Trip deleted' });
  } catch (err) {
    console.error('Delete trip error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
