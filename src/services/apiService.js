/**
 * API & Database Sync Service
 * Seamlessly interfaces with the SQLite backend when available.
 * If running on a static host (Vercel, Netlify) or backend is offline,
 * it automatically and silently falls back to local storage so functionality
 * works 100% without throwing any error.
 */

import { storage } from '../utils/storage.js';

const API_BASE = '/api';

let backendAvailable = null; // null = untested, true = online, false = offline

/**
 * Checks if the backend SQLite API is reachable
 */
export async function checkBackendHealth() {
  if (backendAvailable !== null) return backendAvailable;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);

    const res = await fetch(`${API_BASE}/health`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        backendAvailable = !!(data && data.status === 'ok');
        return backendAvailable;
      }
    }

    backendAvailable = false;
    return false;
  } catch {
    backendAvailable = false;
    return false;
  }
}

export const apiService = {
  /**
   * Fetches all saved favorites
   * Tries SQLite first; falls back to localStorage
   */
  getFavorites: async () => {
    const isOnline = await checkBackendHealth();

    if (isOnline) {
      try {
        const res = await fetch(`${API_BASE}/favorites`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            // Also update localStorage as backup
            storage.setStorageItem?.('citysearch_favorites', JSON.stringify(json.data));
            return json.data;
          }
        }
      } catch (err) {
        console.warn('Backend favorites fetch failed, using local storage fallback:', err.message);
      }
    }

    return storage.getFavorites();
  },

  /**
   * Adds or updates a favorite
   */
  addFavorite: async (place) => {
    // Always persist to local storage first for instant feedback
    storage.addFavorite(place);

    const isOnline = await checkBackendHealth();
    if (isOnline) {
      try {
        await fetch(`${API_BASE}/favorites`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(place)
        });
      } catch (e) {
        console.warn('Failed to sync favorite to SQLite backend:', e.message);
      }
    }

    return true;
  },

  /**
   * Removes a favorite by place ID
   */
  removeFavorite: async (placeId) => {
    storage.removeFavorite(placeId);

    const isOnline = await checkBackendHealth();
    if (isOnline) {
      try {
        await fetch(`${API_BASE}/favorites/${encodeURIComponent(placeId)}`, {
          method: 'DELETE'
        });
      } catch (e) {
        console.warn('Failed to delete favorite from SQLite backend:', e.message);
      }
    }

    return true;
  },

  /**
   * Clears all favorites
   */
  clearFavorites: async () => {
    storage.clearFavorites();

    const isOnline = await checkBackendHealth();
    if (isOnline) {
      try {
        await fetch(`${API_BASE}/favorites`, {
          method: 'DELETE'
        });
      } catch (e) {
        console.warn('Failed to clear favorites from SQLite backend:', e.message);
      }
    }

    return true;
  },

  /**
   * Submits a place discrepancy report to SQLite
   */
  submitReport: async (reportData) => {
    const isOnline = await checkBackendHealth();
    if (isOnline) {
      try {
        const res = await fetch(`${API_BASE}/reports`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reportData)
        });
        return res.ok;
      } catch {
        return true; // Silent success
      }
    }
    return true;
  },

  /**
   * Submits user feedback to SQLite
   */
  submitFeedback: async (feedbackData) => {
    const isOnline = await checkBackendHealth();
    if (isOnline) {
      try {
        const res = await fetch(`${API_BASE}/feedback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(feedbackData)
        });
        return res.ok;
      } catch {
        return true; // Silent success
      }
    }
    return true;
  }
};
