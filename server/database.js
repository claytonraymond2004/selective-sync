const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = process.env.DATA_DIR || path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'selective_sync.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Initialize Schema
const schema = `
  CREATE TABLE IF NOT EXISTS config (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS sync_locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    path TEXT UNIQUE NOT NULL,
    label TEXT
  );

  CREATE TABLE IF NOT EXISTS sync_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    remote_path TEXT NOT NULL,
    local_path TEXT NOT NULL,
    type TEXT CHECK(type IN ('file', 'folder')) NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, synced, error, syncing
    last_synced_at DATETIME,
    error_message TEXT,
    active INTEGER DEFAULT 1,
    UNIQUE(remote_path, local_path)
  );

  CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL, -- sync, check
    sync_item_id INTEGER,
    status TEXT DEFAULT 'queued', -- queued, running, completed, failed
    priority INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    started_at DATETIME,
    completed_at DATETIME,
    log TEXT,
    processed_bytes INTEGER DEFAULT 0,
    total_bytes INTEGER DEFAULT 0,
    current_speed REAL, -- bytes per second
    eta_seconds INTEGER,
    FOREIGN KEY(sync_item_id) REFERENCES sync_items(id)
  );
`;

db.exec(schema);

// Migrations for existing deployments
try {
    db.prepare('ALTER TABLE jobs ADD COLUMN processed_bytes INTEGER DEFAULT 0').run();
} catch (e) { } // Ignore if column exists

try {
    db.prepare('ALTER TABLE jobs ADD COLUMN total_bytes INTEGER DEFAULT 0').run();
} catch (e) { }

try {
    db.prepare('ALTER TABLE jobs ADD COLUMN current_speed REAL').run();
} catch (e) { }

try {
    db.prepare('ALTER TABLE jobs ADD COLUMN eta_seconds INTEGER').run();
} catch (e) { }

try {
    db.prepare('ALTER TABLE jobs ADD COLUMN failed_items TEXT').run(); // JSON array of { path, error }
} catch (e) { }

module.exports = db;
