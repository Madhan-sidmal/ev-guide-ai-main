const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { authenticateToken, generateToken } = require('../middleware/auth');

const router = express.Router();

// ── POST /api/auth/signup ──────────────────────────────────────
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const id = uuidv4();
    const password_hash = await bcrypt.hash(password, 12);

    db.prepare(`
      INSERT INTO users (id, name, email, password_hash)
      VALUES (?, ?, ?, ?)
    `).run(id, name, email, password_hash);

    // Create default preferences
    db.prepare(`
      INSERT INTO preferences (id, user_id)
      VALUES (?, ?)
    `).run(uuidv4(), id);

    const user = {
      id,
      name,
      email,
      avatarUrl: null,
      savedVehicles: [],
      notificationSettings: { email: true, push: true, chargingAlerts: true },
    };

    const token = generateToken({ id, email });

    res.status(201).json({ token, user });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── POST /api/auth/login ───────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const dbUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!dbUser) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, dbUser.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Fetch user's vehicles
    const vehicles = db.prepare('SELECT * FROM vehicles WHERE user_id = ?').all(dbUser.id);

    // Fetch preferences
    const prefs = db.prepare('SELECT * FROM preferences WHERE user_id = ?').get(dbUser.id);

    const user = {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      avatarUrl: dbUser.avatar_url,
      savedVehicles: vehicles.map(v => ({
        id: v.id,
        name: v.model_name,
        manufacturer: v.manufacturer,
        batteryCapacity: v.battery_capacity,
        range: Math.round(v.battery_capacity / v.learned_efficiency * 1000),
        efficiency: v.learned_efficiency / 1000, // convert Wh/km to kWh/km
      })),
      notificationSettings: {
        email: prefs?.notification_email === 1,
        push: prefs?.notification_push === 1,
        chargingAlerts: prefs?.charging_alerts === 1,
      },
    };

    const token = generateToken({ id: dbUser.id, email: dbUser.email });

    res.json({ token, user });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── POST /api/auth/forgot-password ─────────────────────────────
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Stub — in production, send a reset email
  res.json({ message: 'If this email is registered, you will receive a password reset link.' });
});

// ── GET /api/auth/profile ──────────────────────────────────────
router.get('/profile', authenticateToken, (req, res) => {
  try {
    const dbUser = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    if (!dbUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const vehicles = db.prepare('SELECT * FROM vehicles WHERE user_id = ?').all(dbUser.id);
    const prefs = db.prepare('SELECT * FROM preferences WHERE user_id = ?').get(dbUser.id);

    res.json({
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      avatarUrl: dbUser.avatar_url,
      savedVehicles: vehicles.map(v => ({
        id: v.id,
        name: v.model_name,
        manufacturer: v.manufacturer,
        batteryCapacity: v.battery_capacity,
        range: Math.round(v.battery_capacity / v.learned_efficiency * 1000),
        efficiency: v.learned_efficiency / 1000,
      })),
      notificationSettings: {
        email: prefs?.notification_email === 1,
        push: prefs?.notification_push === 1,
        chargingAlerts: prefs?.charging_alerts === 1,
      },
    });
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
