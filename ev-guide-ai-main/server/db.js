const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'ev_guide.db');

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ── Create Tables ──────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    avatar_url TEXT,
    default_vehicle_id TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS vehicles (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    model_name TEXT NOT NULL,
    manufacturer TEXT NOT NULL,
    battery_capacity REAL NOT NULL,
    base_efficiency REAL NOT NULL,
    learned_efficiency REAL NOT NULL,
    degradation_factor REAL NOT NULL DEFAULT 0.0,
    total_trips INTEGER NOT NULL DEFAULT 0,
    total_distance REAL NOT NULL DEFAULT 0.0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS ev_models (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    manufacturer TEXT NOT NULL,
    battery_capacity REAL NOT NULL,
    range_km REAL NOT NULL,
    efficiency REAL NOT NULL
  );

  CREATE TABLE IF NOT EXISTS trips (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    vehicle_id TEXT,
    start_location TEXT NOT NULL,
    end_location TEXT NOT NULL,
    distance REAL NOT NULL,
    duration INTEGER,
    predicted_consumption REAL,
    actual_consumption REAL,
    weather_condition TEXT,
    route_type TEXT DEFAULT 'mixed',
    carbon_saved REAL DEFAULT 0.0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS preferences (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    preferred_mode TEXT NOT NULL DEFAULT 'balanced',
    min_battery_buffer REAL NOT NULL DEFAULT 20.0,
    prefers_charging_stops INTEGER NOT NULL DEFAULT 1,
    notification_email INTEGER NOT NULL DEFAULT 1,
    notification_push INTEGER NOT NULL DEFAULT 1,
    charging_alerts INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS charging_history (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    trip_id TEXT,
    station_name TEXT NOT NULL,
    location TEXT NOT NULL,
    charging_time INTEGER,
    energy_added REAL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE SET NULL
  );
`);

// ── Create Indexes ─────────────────────────────────────────────

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_vehicles_user ON vehicles(user_id);
  CREATE INDEX IF NOT EXISTS idx_trips_user ON trips(user_id);
  CREATE INDEX IF NOT EXISTS idx_trips_vehicle ON trips(vehicle_id);
  CREATE INDEX IF NOT EXISTS idx_trips_created ON trips(created_at);
  CREATE INDEX IF NOT EXISTS idx_charging_user ON charging_history(user_id);
`);

console.log('✅ Database initialized with all tables');

module.exports = db;
