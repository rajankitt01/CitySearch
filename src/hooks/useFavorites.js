import { useState, useCallback, useEffect } from 'react';
import { storage } from '../utils/storage.js';
import { apiService } from '../services/apiService.js';

export function useFavorites() {
  const [favorites, setFavorites] = useState(() => storage.getFavorites());

  // Load and sync from SQLite database on mount
  useEffect(() => {
    let active = true;
    apiService.getFavorites().then((data) => {
      if (active && Array.isArray(data)) {
        setFavorites(data);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const addFavorite = useCallback((place) => {
    if (!place || !place.id) return false;
    apiService.addFavorite(place);
    setFavorites(prev => {
      if (prev.some(f => f.id === place.id)) return prev;
      return [place, ...prev];
    });
    return true;
  }, []);

  const removeFavorite = useCallback((placeId) => {
    apiService.removeFavorite(placeId);
    setFavorites(prev => prev.filter(f => f.id !== placeId));
    return true;
  }, []);

  const toggleFavorite = useCallback((place) => {
    if (!place || !place.id) return false;
    const exists = favorites.some(f => f.id === place.id);
    if (exists) {
      removeFavorite(place.id);
      return false;
    } else {
      addFavorite(place);
      return true;
    }
  }, [favorites, addFavorite, removeFavorite]);

  const isFavorite = useCallback((placeId) => {
    return favorites.some(f => f.id === placeId);
  }, [favorites]);

  const clearAllFavorites = useCallback(() => {
    apiService.clearFavorites();
    setFavorites([]);
  }, []);

  return {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    clearAllFavorites,
    favoritesCount: favorites.length
  };
}
