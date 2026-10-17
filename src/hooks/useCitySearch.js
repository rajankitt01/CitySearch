import { useState, useEffect, useCallback, useRef } from 'react';
import { searchLocation, reverseGeocode, POPULAR_CITIES } from '../services/geocodingService.js';
import { storage } from '../utils/storage.js';

export function useCitySearch(initialCity = null) {
  const [query, setQuery] = useState(initialCity ? initialCity.name || '' : '');
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => storage.getRecentSearches());
  const [searchError, setSearchError] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  const debounceTimerRef = useRef(null);

  const updateQuery = useCallback((newQuery) => {
    setQuery(newQuery);
    if (!newQuery || newQuery.trim().length < 2) {
      setSuggestions([]);
      setIsSearching(false);
    } else {
      setIsSearching(true);
      setSearchError(null);
    }
  }, []);

  // Update recent searches
  const handleSelectCity = useCallback((cityObj) => {
    if (!cityObj || !cityObj.lat || !cityObj.lon) return;

    setSelectedCity(cityObj);
    setQuery(cityObj.name);
    setSuggestions([]);
    setSearchError(null);

    // Save to storage and update local state
    storage.addRecentSearch(cityObj);
    setRecentSearches(storage.getRecentSearches());
  }, []);

  // Debounced search for suggestions as user types
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      return;
    }

    // If query matches currently selected city name, don't re-trigger dropdown
    if (selectedCity && selectedCity.name.toLowerCase() === query.trim().toLowerCase()) {
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const results = await searchLocation(query);
        setSuggestions(results);
      } catch (err) {
        setSearchError(err.message || 'Error finding location suggestions');
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 350); // 350ms debounce

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, selectedCity]);

  // Execute explicit search on form submit / Enter key
  const executeSearch = useCallback(async (searchQuery = query) => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchError('Please enter a city or town name to search.');
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const results = await searchLocation(searchQuery);
      if (results && results.length > 0) {
        handleSelectCity(results[0]);
      } else {
        setSearchError(`No matching cities found for "${searchQuery}". Please check the spelling.`);
      }
    } catch (err) {
      setSearchError(err.message || 'Unable to find that city. Please try again.');
    } finally {
      setIsSearching(false);
      setSuggestions([]);
    }
  }, [query, handleSelectCity]);

  // Explicit browser geolocation trigger with permission
  const locateUser = useCallback(() => {
    if (!navigator.geolocation) {
      setSearchError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setSearchError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const resolved = await reverseGeocode(latitude, longitude);
          handleSelectCity(resolved);
        } catch {
          setSearchError('Could not resolve your location name. Please search manually.');
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          setSearchError('Location access was denied. You can search any city by typing its name.');
        } else {
          setSearchError('Unable to retrieve your location. Please type a city name.');
        }
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  }, [handleSelectCity]);

  // Clear search history
  const clearHistory = useCallback(() => {
    storage.clearRecentSearches();
    setRecentSearches([]);
  }, []);

  return {
    query,
    setQuery: updateQuery,
    selectedCity,
    setSelectedCity: handleSelectCity,
    suggestions,
    isSearching,
    isLocating,
    searchError,
    recentSearches,
    popularCities: POPULAR_CITIES,
    executeSearch,
    locateUser,
    clearHistory,
    clearSuggestions: () => setSuggestions([])
  };
}
