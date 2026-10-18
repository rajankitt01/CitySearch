/**
 * SQLite Database Manager
 * Uses Node.js's built-in native SQLite engine (node:sqlite DatabaseSync)
 * Creates and maintains the SQLite database file in `server/data/database.sqlite`.
 * You can inspect or edit this file manually using any SQLite viewer (DB Browser for SQLite, DBeaver, etc.)
 */

import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const DB_PATH = path.join(dataDir, 'database.sqlite');

let dbInstance = null;

export function getDatabase() {
  if (dbInstance) return dbInstance;

  dbInstance = new DatabaseSync(DB_PATH);

  // Enable WAL (Write-Ahead Logging) mode for fast concurrent reads and durability
  dbInstance.exec('PRAGMA journal_mode = WAL;');

  // Initialize tables
  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS favorites (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      sub_category TEXT,
      lat REAL NOT NULL,
      lon REAL NOT NULL,
      distance REAL,
      formatted_distance TEXT,
      address TEXT,
      phone TEXT,
      website TEXT,
      opening_hours TEXT,
      operator TEXT,
      wheelchair TEXT,
      provider TEXT,
      raw_tags TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      place_id TEXT,
      place_name TEXT,
      issue_type TEXT,
      details TEXT,
      email TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rating INTEGER,
      comment TEXT,
      email TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  return dbInstance;
}

// Normalize DB row to Place object
function rowToPlace(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    subCategory: row.sub_category,
    lat: row.lat,
    lon: row.lon,
    distance: row.distance,
    formattedDistance: row.formatted_distance,
    address: row.address,
    phone: row.phone,
    website: row.website,
    openingHours: row.opening_hours,
    operator: row.operator,
    wheelchair: row.wheelchair,
    provider: row.provider,
    rawTags: row.raw_tags ? JSON.parse(row.raw_tags) : {},
    createdAt: row.created_at
  };
}

export const dbService = {
  // Favorites Operations
  getAllFavorites: () => {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM favorites ORDER BY created_at DESC');
    const rows = stmt.all();
    return rows.map(rowToPlace);
  },

  getFavoriteById: (id) => {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM favorites WHERE id = ?');
    const row = stmt.get(id);
    return rowToPlace(row);
  },

  addFavorite: (place) => {
    if (!place || !place.id || !place.name) {
      throw new Error('Invalid place object');
    }

    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO favorites (
        id, name, category, sub_category, lat, lon, distance,
        formatted_distance, address, phone, website, opening_hours,
        operator, wheelchair, provider, raw_tags, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    stmt.run(
      place.id,
      place.name,
      place.category || 'other',
      place.subCategory || null,
      place.lat,
      place.lon,
      place.distance ?? null,
      place.formattedDistance || null,
      place.address || null,
      place.phone || null,
      place.website || null,
      place.openingHours || null,
      place.operator || null,
      place.wheelchair || null,
      place.provider || 'OpenStreetMap',
      place.rawTags ? JSON.stringify(place.rawTags) : null
    );

    return dbService.getFavoriteById(place.id);
  },

  removeFavorite: (id) => {
    const db = getDatabase();
    const stmt = db.prepare('DELETE FROM favorites WHERE id = ?');
    stmt.run(id);
    return true;
  },

  clearFavorites: () => {
    const db = getDatabase();
    db.exec('DELETE FROM favorites');
    return true;
  },

  // Reports Operations
  addReport: ({ placeId, placeName, issueType, details, email }) => {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO reports (place_id, place_name, issue_type, details, email, created_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);
    stmt.run(placeId || null, placeName || null, issueType, details, email || null);
    return true;
  },

  getAllReports: () => {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM reports ORDER BY created_at DESC');
    return stmt.all();
  },

  // Feedback Operations
  addFeedback: ({ rating, comment, email }) => {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO feedback (rating, comment, email, created_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `);
    stmt.run(rating || 5, comment, email || null);
    return true;
  },

  getAllFeedback: () => {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM feedback ORDER BY created_at DESC');
    return stmt.all();
  }
};
