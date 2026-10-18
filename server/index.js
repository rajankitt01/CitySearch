/**
 * CitySearch Express Server & SQLite Backend
 * Serves the REST API for favorites, feedback, and reports stored in SQLite.
 * In production, it also serves the built Vite frontend from `dist/`.
 */

import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dbService, DB_PATH } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// API Health Check & Database Info
app.get('/api/health', (req, res) => {
  try {
    const favorites = dbService.getAllFavorites();
    res.json({
      status: 'ok',
      database: 'connected',
      dbPath: DB_PATH,
      favoritesCount: favorites.length,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.get('/api/db/info', (req, res) => {
  try {
    const stats = fs.existsSync(DB_PATH) ? fs.statSync(DB_PATH) : null;
    const favorites = dbService.getAllFavorites();
    const reports = dbService.getAllReports();
    const feedback = dbService.getAllFeedback();

    res.json({
      dbPath: DB_PATH,
      sizeBytes: stats ? stats.size : 0,
      counts: {
        favorites: favorites.length,
        reports: reports.length,
        feedback: feedback.length
      },
      instructions: 'You can open this database.sqlite file in DB Browser for SQLite, DBeaver, or SQLiteStudio to view and edit tables manually.'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Favorites REST Endpoints
app.get('/api/favorites', (req, res) => {
  try {
    const favorites = dbService.getAllFavorites();
    res.json({ success: true, data: favorites });
  } catch (err) {
    console.error('Error fetching favorites:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/favorites', (req, res) => {
  try {
    const place = req.body;
    if (!place || !place.id || !place.name) {
      return res.status(400).json({ success: false, error: 'Valid place object required' });
    }
    const saved = dbService.addFavorite(place);
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    console.error('Error saving favorite:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/favorites/:id', (req, res) => {
  try {
    const { id } = req.params;
    dbService.removeFavorite(id);
    res.json({ success: true, message: `Removed favorite ${id}` });
  } catch (err) {
    console.error('Error deleting favorite:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/favorites', (req, res) => {
  try {
    dbService.clearFavorites();
    res.json({ success: true, message: 'All favorites cleared' });
  } catch (err) {
    console.error('Error clearing favorites:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Reports Endpoints
app.get('/api/reports', (req, res) => {
  try {
    const reports = dbService.getAllReports();
    res.json({ success: true, data: reports });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/reports', (req, res) => {
  try {
    const { placeId, placeName, issueType, details, email } = req.body;
    if (!issueType || !details) {
      return res.status(400).json({ success: false, error: 'Issue type and details required' });
    }
    dbService.addReport({ placeId, placeName, issueType, details, email });
    res.status(201).json({ success: true, message: 'Report recorded in database' });
  } catch (err) {
    console.error('Error adding report:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Feedback Endpoints
app.get('/api/feedback', (req, res) => {
  try {
    const feedback = dbService.getAllFeedback();
    res.json({ success: true, data: feedback });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/feedback', (req, res) => {
  try {
    const { rating, comment, email } = req.body;
    if (!comment) {
      return res.status(400).json({ success: false, error: 'Comment required' });
    }
    dbService.addFeedback({ rating, comment, email });
    res.status(201).json({ success: true, message: 'Feedback recorded in database' });
  } catch (err) {
    console.error('Error adding feedback:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Serve frontend static build in production
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });
}

// Start Server
app.listen(PORT, () => {
  console.log(`[CitySearch SQLite Server] Running at http://localhost:${PORT}`);
  console.log(`[Database File Location] ${DB_PATH}`);
  console.log(`[API Endpoints] /api/favorites, /api/reports, /api/feedback, /api/health`);
});
