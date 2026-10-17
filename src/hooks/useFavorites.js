import { useState, useCallback } from 'react';
import { storage } from '../utils/storage.js';

export function useFavorites() {
  const [favorites, setFavorites] = useState(() => storage.getFavorites());

  const addFavorite = useCallback((place) => {
    const success = storage.addFavorite(place);
    if (success) {
      setFavorites(storage.getFavorites());
    }
    return success;
  }, []);

  const removeFavorite = useCallback((placeId) => {
    const success = storage.removeFavorite(placeId);
    if (success) {
      setFavorites(storage.getFavorites());
    }
    return success;
  }, []);

  const toggleFavorite = useCallback((place) => {
    if (!place || !place.id) return false;
    const isFav = storage.isFavorite(place.id);
    if (isFav) {
      removeFavorite(place.id);
      return false;
    } else {
      addFavorite(place);
      return true;
    }
  }, [addFavorite, removeFavorite]);

  const isFavorite = useCallback((placeId) => {
    return favorites.some(f => f.id === placeId);
  }, [favorites]);

  const clearAllFavorites = useCallback(() => {
    storage.clearFavorites();
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
