const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

router.get('/', (req, res) => {
  try {
    const prefs = db.prepare('SELECT * FROM preferences WHERE user_id = ?').get(req.user.id);
    if (!prefs) {
      return res.json({ preferredMode: 'balanced', minBatteryBuffer: 20, prefersChargingStops: true, notificationEmail: true, notificationPush: true, chargingAlerts: true });
    }
    res.json({ preferredMode: prefs.preferred_mode, minBatteryBuffer: prefs.min_battery_buffer, prefersChargingStops: prefs.prefers_charging_stops === 1, notificationEmail: prefs.notification_email === 1, notificationPush: prefs.notification_push === 1, chargingAlerts: prefs.charging_alerts === 1 });
  } catch (err) { console.error('Get preferences error:', err); res.status(500).json({ error: 'Internal server error' }); }
});

router.put('/', (req, res) => {
  try {
    const { preferredMode, minBatteryBuffer, prefersChargingStops, notificationEmail, notificationPush, chargingAlerts } = req.body;
    const validModes = ['eco', 'fast', 'balanced'];
    if (preferredMode && !validModes.includes(preferredMode)) {
      return res.status(400).json({ error: `preferredMode must be one of: ${validModes.join(', ')}` });
    }
    const existing = db.prepare('SELECT id FROM preferences WHERE user_id = ?').get(req.user.id);
    if (existing) {
      db.prepare(`UPDATE preferences SET preferred_mode = COALESCE(?, preferred_mode), min_battery_buffer = COALESCE(?, min_battery_buffer), prefers_charging_stops = COALESCE(?, prefers_charging_stops), notification_email = COALESCE(?, notification_email), notification_push = COALESCE(?, notification_push), charging_alerts = COALESCE(?, charging_alerts) WHERE user_id = ?`).run(
        preferredMode || null, minBatteryBuffer ?? null,
        prefersChargingStops != null ? (prefersChargingStops ? 1 : 0) : null,
        notificationEmail != null ? (notificationEmail ? 1 : 0) : null,
        notificationPush != null ? (notificationPush ? 1 : 0) : null,
        chargingAlerts != null ? (chargingAlerts ? 1 : 0) : null,
        req.user.id
      );
    } else {
      const { v4: uuidv4 } = require('uuid');
      db.prepare(`INSERT INTO preferences (id, user_id, preferred_mode, min_battery_buffer, prefers_charging_stops, notification_email, notification_push, charging_alerts) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
        uuidv4(), req.user.id, preferredMode || 'balanced', minBatteryBuffer ?? 20,
        prefersChargingStops ? 1 : 0, notificationEmail !== false ? 1 : 0, notificationPush !== false ? 1 : 0, chargingAlerts !== false ? 1 : 0
      );
    }
    const updated = db.prepare('SELECT * FROM preferences WHERE user_id = ?').get(req.user.id);
    res.json({ preferredMode: updated.preferred_mode, minBatteryBuffer: updated.min_battery_buffer, prefersChargingStops: updated.prefers_charging_stops === 1, notificationEmail: updated.notification_email === 1, notificationPush: updated.notification_push === 1, chargingAlerts: updated.charging_alerts === 1 });
  } catch (err) { console.error('Update preferences error:', err); res.status(500).json({ error: 'Internal server error' }); }
});

module.exports = router;
