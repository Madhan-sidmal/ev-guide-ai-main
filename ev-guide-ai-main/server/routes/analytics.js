const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { getVehicleAccuracy, getEffectiveEfficiency } = require('../services/learningEngine');

const router = express.Router();
router.use(authenticateToken);

// GET /api/analytics/vehicle/:id — vehicle performance over time
router.get('/vehicle/:id', (req, res) => {
  try {
    const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });

    const trips = db.prepare(`SELECT distance, predicted_consumption, actual_consumption, weather_condition, route_type, created_at FROM trips WHERE vehicle_id = ? AND user_id = ? ORDER BY created_at DESC LIMIT 50`).all(req.params.id, req.user.id);

    const accuracy = getVehicleAccuracy(req.params.id);
    const effective = getEffectiveEfficiency(req.params.id, req.user.id);

    const drainOverDistance = trips.filter(t => t.predicted_consumption).map(t => ({
      distance: t.distance,
      battery: t.actual_consumption || t.predicted_consumption,
      date: t.created_at,
    }));

    const weatherImpact = {};
    trips.forEach(t => {
      const cond = t.weather_condition || 'clear';
      if (!weatherImpact[cond]) weatherImpact[cond] = { total: 0, count: 0 };
      weatherImpact[cond].total += t.actual_consumption || t.predicted_consumption || 0;
      weatherImpact[cond].count += 1;
    });

    res.json({
      vehicle: { id: vehicle.id, modelName: vehicle.model_name, manufacturer: vehicle.manufacturer, baseEfficiency: vehicle.base_efficiency, learnedEfficiency: vehicle.learned_efficiency, degradationFactor: vehicle.degradation_factor, totalTrips: vehicle.total_trips, totalDistance: vehicle.total_distance },
      accuracy,
      effectiveEfficiency: effective,
      drainOverDistance,
      weatherImpact: Object.entries(weatherImpact).map(([condition, data]) => ({ condition, avgConsumption: Math.round(data.total / data.count * 10) / 10, trips: data.count })),
    });
  } catch (err) { console.error('Vehicle analytics error:', err); res.status(500).json({ error: 'Internal server error' }); }
});

// GET /api/analytics/efficiency — prediction accuracy trend
router.get('/efficiency', (req, res) => {
  try {
    const trips = db.prepare(`SELECT t.id, t.predicted_consumption, t.actual_consumption, t.created_at, v.model_name FROM trips t LEFT JOIN vehicles v ON t.vehicle_id = v.id WHERE t.user_id = ? AND t.actual_consumption IS NOT NULL ORDER BY t.created_at DESC LIMIT 100`).all(req.user.id);

    const trend = trips.map(t => ({
      date: t.created_at, predicted: t.predicted_consumption, actual: t.actual_consumption,
      error: Math.round(Math.abs(t.actual_consumption - t.predicted_consumption) * 10) / 10,
      vehicle: t.model_name,
    }));

    const avgError = trend.length > 0 ? trend.reduce((a, t) => a + t.error, 0) / trend.length : 0;

    res.json({ trend, overallAccuracy: Math.round((100 - avgError) * 10) / 10, sampleSize: trend.length });
  } catch (err) { console.error('Efficiency analytics error:', err); res.status(500).json({ error: 'Internal server error' }); }
});

module.exports = router;
