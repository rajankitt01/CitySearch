/**
 * CLI Database Viewer
 * Displays current contents of database.sqlite in a clean terminal table.
 * Usage: npm run db:view
 */

import { dbService, DB_PATH } from '../server/db.js';
import fs from 'node:fs';

console.log('='.repeat(70));
console.log('  CitySearch SQLite Database Inspector');
console.log('='.repeat(70));
console.log(`Database File: ${DB_PATH}`);

if (!fs.existsSync(DB_PATH)) {
  console.log('\nDatabase file has not been created yet. Run the server or add a favorite first.\n');
  process.exit(0);
}

const stats = fs.statSync(DB_PATH);
console.log(`Database Size: ${(stats.size / 1024).toFixed(2)} KB\n`);

// 1. Favorites Table
const favorites = dbService.getAllFavorites();
console.log(`--- [1] FAVORITES TABLE (${favorites.length} rows) ---`);
if (favorites.length === 0) {
  console.log('No favorites saved yet.\n');
} else {
  console.table(
    favorites.map(f => ({
      ID: f.id,
      Name: f.name.length > 28 ? f.name.substring(0, 25) + '...' : f.name,
      Category: f.category,
      SubCategory: f.subCategory || 'N/A',
      Coordinates: `${f.lat.toFixed(3)}, ${f.lon.toFixed(3)}`,
      Distance: f.formattedDistance || 'N/A',
      SavedAt: f.createdAt ? f.createdAt.split('T')[0] : 'Today'
    }))
  );
}

// 2. Feedback Table
const feedback = dbService.getAllFeedback();
console.log(`--- [2] FEEDBACK TABLE (${feedback.length} rows) ---`);
if (feedback.length === 0) {
  console.log('No feedback entries yet.\n');
} else {
  console.table(
    feedback.map(fb => ({
      ID: fb.id,
      Rating: `${'★'.repeat(fb.rating)}${'☆'.repeat(5 - fb.rating)}`,
      Comment: fb.comment.length > 35 ? fb.comment.substring(0, 32) + '...' : fb.comment,
      Email: fb.email || '(anonymous)',
      Date: fb.created_at
    }))
  );
}

// 3. Reports Table
const reports = dbService.getAllReports();
console.log(`--- [3] REPORTED PLACES TABLE (${reports.length} rows) ---`);
if (reports.length === 0) {
  console.log('No place discrepancy reports yet.\n');
} else {
  console.table(
    reports.map(r => ({
      ID: r.id,
      Place: r.place_name || r.place_id,
      Issue: r.issue_type,
      Details: r.details.length > 30 ? r.details.substring(0, 27) + '...' : r.details,
      Email: r.email || '(anonymous)',
      Date: r.created_at
    }))
  );
}

console.log('='.repeat(70));
console.log('Tip: You can also open this SQLite file in "DB Browser for SQLite"');
console.log('     Download: https://sqlitebrowser.org/');
console.log('='.repeat(70));
