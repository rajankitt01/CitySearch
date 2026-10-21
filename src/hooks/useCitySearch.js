import { useState, useEffect, useCallback, useRef } from 'react';
import { searchLocation, reverseGeocode, matchLocalCities, POPULAR_CITIES } from '../services/geocodingService.js';
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
  const abortControllerRef = useRef(null);

  // Synchronize state when initialCity changes (React recommended pattern)
  const [prevInitialCity, setPrevInitialCity] = useState(initialCity);
  if (initialCity && initialCity !== prevInitialCity) {
    setPrevInitialCity(initialCity);
    setSelectedCity(initialCity);
    setQuery(initialCity.name || '');
  }

  const handleSelectCity = useCallback((cityObj) => {
    if (!cityObj || !cityObj.lat || !cityObj.lon) return;

    // Cancel any in-flight searches
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (abortControllerRef.current) abortControllerRef.current.abort();

    setSelectedCity(cityObj);
    setQuery(cityObj.name);
    setSuggestions([]);
    setIsSearching(false);
    setSearchError(null);

    // Save to storage and update local state
    storage.addRecentSearch(cityObj);
    setRecentSearches(storage.getRecentSearches());
  }, []);

  const updateQuery = useCallback((newQuery) => {
    setQuery(newQuery);
    if (!newQuery || newQuery.trim().length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      setSearchError(null);
      if (abortControllerRef.current) abortControllerRef.current.abort();
      return;
    }

    // Instant zero-latency local suggestions check
    const localMatches = matchLocalCities(newQuery);
    if (localMatches.length > 0) {
      setSuggestions(localMatches.slice(0, 8));
    }
    setSearchError(null);
  }, []);

  // Debounced search for remote suggestions / refining as user types
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
      // Abort previous in-flight fetch
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsSearching(true);
      try {
        const results = await searchLocation(query, controller.signal);
        if (!controller.signal.aborted) {
          setSuggestions(results);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          setSearchError(err.message || 'Error finding location suggestions');
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSearching(false);
        }
      }
    }, 180); // Ultra-responsive 180ms debounce

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, selectedCity]);

  // Execute search immediately on form submit / Enter key
  const executeSearch = useCallback(async (searchQuery = query) => {
    const q = (searchQuery || '').trim();
    if (q.length < 2) {
      setSearchError('Please enter a city or town name to search.');
      return;
    }

    // If suggestions are already available, immediately select the top suggestion!
    if (suggestions.length > 0) {
      handleSelectCity(suggestions[0]);
      return;
    }

    // Check fast local matching index immediately
    const localMatches = matchLocalCities(q);
    if (localMatches.length > 0) {
      handleSelectCity(localMatches[0]);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const results = await searchLocation(q);
      if (results && results.length > 0) {
        handleSelectCity(results[0]);
      } else {
        setSearchError(`No matching cities found for "${q}". Please check the spelling.`);
      }
    } catch (err) {
      setSearchError(err.message || 'Unable to find that city. Please try again.');
    } finally {
      setIsSearching(false);
      setSuggestions([]);
    }
  }, [query, suggestions, handleSelectCity]);

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
      { timeout: 8000, enableHighAccuracy: false }
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
