/**
 * Local storage utility with safe error handling, memory fallback, and caching support
 */

const RECENT_SEARCHES_KEY = 'citysearch_recent_cities';
const FAVORITES_KEY = 'citysearch_favorites';
const THEME_KEY = 'citysearch_theme';
const CACHE_PREFIX = 'citysearch_cache_';

// In-memory fallback if localStorage is unavailable
const memoryStore = new Map();

function getStorageItem(key) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    return memoryStore.get(key) || null;
  } catch {
    return memoryStore.get(key) || null;
  }
}

function setStorageItem(key, value) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    } else {
      memoryStore.set(key, value);
    }
  } catch {
    memoryStore.set(key, value);
  }
}

function removeStorageItem(key) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
    memoryStore.delete(key);
  } catch {
    memoryStore.delete(key);
  }
}

export const storage = {
  // Recent Searches
  getRecentSearches: () => {
    try {
      const data = getStorageItem(RECENT_SEARCHES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn('Could not read recent searches from storage', e);
      return [];
    }
  },

  addRecentSearch: (cityObj) => {
    if (!cityObj || !cityObj.name) return;
    try {
      const current = storage.getRecentSearches();
      const filtered = current.filter(
        c => c.name.toLowerCase() !== cityObj.name.toLowerCase()
      );
      const updated = [cityObj, ...filtered].slice(0, 10);
      setStorageItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not save recent search', e);
    }
  },

  clearRecentSearches: () => {
    removeStorageItem(RECENT_SEARCHES_KEY);
  },

  // Favorites
  getFavorites: () => {
    try {
      const data = getStorageItem(FAVORITES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn('Could not read favorites from storage', e);
      return [];
    }
  },

  addFavorite: (place) => {
    if (!place || !place.id) return false;
    try {
      const favorites = storage.getFavorites();
      if (!favorites.some(f => f.id === place.id)) {
        const updated = [place, ...favorites];
        setStorageItem(FAVORITES_KEY, JSON.stringify(updated));
        return true;
      }
      return false;
    } catch (e) {
      console.warn('Could not save favorite', e);
      return false;
    }
  },

  removeFavorite: (placeId) => {
    try {
      const favorites = storage.getFavorites();
      const updated = favorites.filter(f => f.id !== placeId);
      setStorageItem(FAVORITES_KEY, JSON.stringify(updated));
      return true;
    } catch (e) {
      console.warn('Could not remove favorite', e);
      return false;
    }
  },

  isFavorite: (placeId) => {
    try {
      const favorites = storage.getFavorites();
      return favorites.some(f => f.id === placeId);
    } catch {
      return false;
    }
  },

  clearFavorites: () => {
    removeStorageItem(FAVORITES_KEY);
  },

  // Generic Cache with TTL (default 15 minutes)
  getCache: (key) => {
    try {
      const fullKey = CACHE_PREFIX + key;
      const raw = getStorageItem(fullKey);
      if (!raw) return null;

      const item = JSON.parse(raw);
      if (Date.now() > item.expiry) {
        removeStorageItem(fullKey);
        return null;
      }
      return item.value;
    } catch {
      return null;
    }
  },

  setCache: (key, value, ttlMs = 15 * 60 * 1000) => {
    try {
      const fullKey = CACHE_PREFIX + key;
      const item = {
        value,
        expiry: Date.now() + ttlMs,
      };
      setStorageItem(fullKey, JSON.stringify(item));
    } catch (e) {
      console.warn('Failed to cache item', e);
    }
  },

  // Theme preference
  getTheme: () => {
    try {
      return getStorageItem(THEME_KEY) || 'light';
    } catch {
      return 'light';
    }
  },

  setTheme: (theme) => {
    try {
      setStorageItem(THEME_KEY, theme);
    } catch (e) {
      console.warn('Could not save theme', e);
    }
  }
};
