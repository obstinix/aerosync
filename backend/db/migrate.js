import { sqlite } from './index.js';

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS flights (
    id TEXT PRIMARY KEY,
    flight_number TEXT NOT NULL,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    status TEXT DEFAULT 'scheduled',
    scheduled_departure TEXT,
    estimated_departure TEXT,
    scheduled_arrival TEXT,
    estimated_arrival TEXT,
    gate TEXT,
    aircraft_type TEXT,
    cargo_weight_kg REAL DEFAULT 0,
    delay_minutes INTEGER DEFAULT 0,
    progress_pct REAL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS cargo (
    id TEXT PRIMARY KEY,
    flight_id TEXT REFERENCES flights(id),
    manifest_number TEXT NOT NULL,
    weight_kg REAL NOT NULL,
    capacity_kg REAL NOT NULL,
    status TEXT DEFAULT 'loaded',
    hazmat INTEGER DEFAULT 0,
    priority TEXT DEFAULT 'standard',
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS disruptions (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    airport TEXT NOT NULL,
    severity INTEGER NOT NULL,
    description TEXT,
    affected_flight_ids TEXT,
    injected_at TEXT DEFAULT (datetime('now')),
    resolved_at TEXT
  );

  CREATE TABLE IF NOT EXISTS alerts (
    id TEXT PRIMARY KEY,
    severity TEXT NOT NULL,
    message TEXT NOT NULL,
    flight_id TEXT,
    disruption_id TEXT,
    acknowledged INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);
console.log('[DB] Tables created.');
