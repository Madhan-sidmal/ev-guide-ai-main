-- ============================================================
-- EV Guide AI — Database Schema
-- Database: SQLite (compatible with PostgreSQL syntax)
-- Team: Pseudo Coders | SSMRV Hackathon 2026
-- ============================================================

-- 1. Users — Identity + Authentication
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    avatar_url TEXT,
    default_vehicle_id TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 2. Vehicles — Per-User, Per-Car Intelligence
-- learned_efficiency evolves from trip data (starts = base_efficiency)
CREATE TABLE IF NOT EXISTS vehicles (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    model_name TEXT NOT NULL,
    manufacturer TEXT NOT NULL,
    battery_capacity REAL NOT NULL,          -- kWh
    base_efficiency REAL NOT NULL,           -- Wh/km (factory spec)
    learned_efficiency REAL NOT NULL,        -- Wh/km (evolves with trips)
    degradation_factor REAL NOT NULL DEFAULT 0.0,  -- 0.0 to 1.0
    total_trips INTEGER NOT NULL DEFAULT 0,
    total_distance REAL NOT NULL DEFAULT 0.0,      -- cumulative km
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. EV Models Catalog — Seed Data (read-only reference)
CREATE TABLE IF NOT EXISTS ev_models (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    manufacturer TEXT NOT NULL,
    battery_capacity REAL NOT NULL,          -- kWh
    range_km REAL NOT NULL,                  -- km
    efficiency REAL NOT NULL                 -- Wh/km
);

-- 4. Trips — The Learning Goldmine
-- Every trip stores predicted AND actual consumption for the learning engine
CREATE TABLE IF NOT EXISTS trips (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    vehicle_id TEXT,
    start_location TEXT NOT NULL,            -- JSON: {lat, lng, address}
    end_location TEXT NOT NULL,              -- JSON: {lat, lng, address}
    distance REAL NOT NULL,                  -- km
    duration INTEGER,                        -- minutes
    predicted_consumption REAL,              -- battery % (what AI predicted)
    actual_consumption REAL,                 -- battery % (user-reported)
    weather_condition TEXT,                  -- clear, rain, snow, etc.
    route_type TEXT DEFAULT 'mixed',         -- highway, city, mixed
    carbon_saved REAL DEFAULT 0.0,           -- kg CO₂
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL
);

-- 5. Preferences — Personal Decision Layer
CREATE TABLE IF NOT EXISTS preferences (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    preferred_mode TEXT NOT NULL DEFAULT 'balanced',   -- eco, balanced, fast
    min_battery_buffer REAL NOT NULL DEFAULT 20.0,     -- minimum % reserve
    prefers_charging_stops INTEGER NOT NULL DEFAULT 1, -- 0 or 1
    notification_email INTEGER NOT NULL DEFAULT 1,
    notification_push INTEGER NOT NULL DEFAULT 1,
    charging_alerts INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. Charging History — Future Analytics Layer
CREATE TABLE IF NOT EXISTS charging_history (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    trip_id TEXT,
    station_name TEXT NOT NULL,
    location TEXT NOT NULL,                  -- JSON: {lat, lng, address}
    charging_time INTEGER,                   -- minutes
    energy_added REAL,                       -- kWh
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE SET NULL
);

-- ============================================================
-- INDEXES — Performance optimization
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_vehicles_user ON vehicles(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_user ON trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_vehicle ON trips(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_trips_created ON trips(created_at);
CREATE INDEX IF NOT EXISTS idx_charging_user ON charging_history(user_id);

-- ============================================================
-- SEED DATA — 10 Real-World EV Models
-- ============================================================

INSERT INTO ev_models (id, name, manufacturer, battery_capacity, range_km, efficiency) VALUES
    ('ev-001', 'Model 3 Long Range',   'Tesla',    75.0,  580, 129),
    ('ev-002', 'Model Y',              'Tesla',    75.0,  533, 141),
    ('ev-003', 'Nexon EV Max',         'Tata',     40.5,  437,  93),
    ('ev-004', 'Nexon EV',             'Tata',     30.2,  312,  97),
    ('ev-005', 'ZS EV',                'MG',       50.3,  461, 109),
    ('ev-006', 'Atto 3',               'BYD',      60.5,  521, 116),
    ('ev-007', 'Kona Electric',        'Hyundai',  39.2,  452,  87),
    ('ev-008', 'XUV400',               'Mahindra', 39.4,  456,  86),
    ('ev-009', 'e6',                   'BYD',      71.7,  520, 138),
    ('ev-010', 'Tigor EV',             'Tata',     26.0,  315,  83);

-- ============================================================
-- LEARNING ENGINE LOGIC (documented, not executable SQL)
-- ============================================================
--
-- After each trip where actual_consumption is reported:
--
--   error = actual_consumption - predicted_consumption
--   correction = error * 0.1  (LEARNING_RATE)
--   new_efficiency = old_efficiency + (correction * base_efficiency / 100)
--
-- Bounded: 50% to 200% of base_efficiency
-- After 10+ trips: system detects battery degradation
--
-- Preference injection before prediction:
--   eco mode:      efficiency * 0.95 (5% better)
--   fast mode:     efficiency * 1.08 (8% worse)
--   balanced mode: no adjustment
-- ============================================================
