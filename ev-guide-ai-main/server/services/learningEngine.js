const db = require('../db');

const LEARNING_RATE = parseFloat(process.env.LEARNING_RATE) || 0.1;

/**
 * Learning Engine — the heart of the adaptation system.
 *
 * After a user reports actual battery consumption for a trip,
 * we adjust the vehicle's learned_efficiency to improve future predictions.
 *
 * Formula:
 *   error = actual_consumption - predicted_consumption
 *   correction = error * LEARNING_RATE
 *   new_efficiency = old_efficiency + (correction * base_efficiency / 100)
 *
 * This creates a feedback loop:
 *   - Under-predicted? Efficiency worsens (higher Wh/km)
 *   - Over-predicted?  Efficiency improves (lower Wh/km)
 *   - After 10+ trips, predictions become vehicle-specific and accurate
 */
function updateVehicleEfficiency(vehicleId, predictedConsumption, actualConsumption) {
  const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(vehicleId);
  if (!vehicle) return null;

  const error = actualConsumption - predictedConsumption;
  const correction = error * LEARNING_RATE;

  // Adjust learned efficiency (Wh/km)
  const newEfficiency = Math.max(
    vehicle.base_efficiency * 0.5,  // floor: never go below 50% of base
    Math.min(
      vehicle.base_efficiency * 2.0, // ceiling: never exceed 200% of base
      vehicle.learned_efficiency + (correction * vehicle.base_efficiency / 100)
    )
  );

  // Update degradation if efficiency is consistently getting worse
  let newDegradation = vehicle.degradation_factor;
  if (vehicle.total_trips >= 10 && newEfficiency > vehicle.base_efficiency * 1.1) {
    // Efficiency is 10%+ worse than factory spec — car is degrading
    newDegradation = Math.min(1.0,
      ((newEfficiency - vehicle.base_efficiency) / vehicle.base_efficiency).toFixed(3)
    );
  }

  db.prepare(`
    UPDATE vehicles
    SET learned_efficiency = ?,
        degradation_factor = ?,
        total_trips = total_trips + 1,
        total_distance = total_distance + COALESCE((
          SELECT distance FROM trips WHERE vehicle_id = ? ORDER BY created_at DESC LIMIT 1
        ), 0)
    WHERE id = ?
  `).run(newEfficiency, newDegradation, vehicleId, vehicleId);

  return {
    previous_efficiency: vehicle.learned_efficiency,
    new_efficiency: newEfficiency,
    correction,
    degradation_factor: newDegradation,
    total_trips: vehicle.total_trips + 1,
  };
}

/**
 * Get the effective efficiency for a vehicle, considering preferences.
 *
 * Mode adjustments:
 *   eco:      +5% efficiency (slower, more conservative)
 *   fast:     -8% efficiency (aggressive driving, more consumption)
 *   balanced: no adjustment
 */
function getEffectiveEfficiency(vehicleId, userId) {
  const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(vehicleId);
  if (!vehicle) return null;

  const prefs = db.prepare('SELECT * FROM preferences WHERE user_id = ?').get(userId);

  let efficiency = vehicle.learned_efficiency;
  let buffer = 15; // default buffer %

  if (prefs) {
    buffer = prefs.min_battery_buffer;

    switch (prefs.preferred_mode) {
      case 'eco':
        efficiency *= 0.95; // 5% better (slower driving)
        buffer = Math.max(buffer, 20);
        break;
      case 'fast':
        efficiency *= 1.08; // 8% worse (aggressive driving)
        buffer = Math.max(buffer - 5, 5);
        break;
      // 'balanced' — no change
    }
  }

  return {
    efficiency: Math.round(efficiency * 100) / 100,
    buffer,
    mode: prefs?.preferred_mode || 'balanced',
    prefers_charging_stops: prefs?.prefers_charging_stops ?? true,
  };
}

/**
 * Calculate prediction accuracy for a vehicle based on historical trips.
 */
function getVehicleAccuracy(vehicleId) {
  const trips = db.prepare(`
    SELECT predicted_consumption, actual_consumption
    FROM trips
    WHERE vehicle_id = ? AND actual_consumption IS NOT NULL
    ORDER BY created_at DESC
    LIMIT 50
  `).all(vehicleId);

  if (trips.length === 0) return { accuracy: null, sample_size: 0 };

  const errors = trips.map(t => Math.abs(t.actual_consumption - t.predicted_consumption));
  const avgError = errors.reduce((a, b) => a + b, 0) / errors.length;
  const accuracy = Math.max(0, 100 - avgError);

  return {
    accuracy: Math.round(accuracy * 10) / 10,
    avg_error: Math.round(avgError * 10) / 10,
    sample_size: trips.length,
  };
}

module.exports = {
  updateVehicleEfficiency,
  getEffectiveEfficiency,
  getVehicleAccuracy,
};
