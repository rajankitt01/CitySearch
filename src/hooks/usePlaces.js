import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { getPlacesByCategory, getCityCategoryOverview } from '../services/placesService.js';
import { PLACE_CATEGORIES } from '../utils/placeCategories.js';
import { storage } from '../utils/storage.js';

export function usePlaces({ city, initialCategory = 'healthcare', initialRadius = 5 }) {
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [radiusKm, setRadiusKm] = useState(initialRadius);
  const [places, setPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Filters & Sorting within results
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('all');
  const [sortBy, setSortBy] = useState('distance'); // 'distance' | 'name'
  const [onlyOpenNow, setOnlyOpenNow] = useState(false);

  // Pagination
  const [visibleCount, setVisibleCount] = useState(12);

  // Map synchronization & selection
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);

  // Category counts overview
  const [categoryCounts, setCategoryCounts] = useState(() => {
    if (city?.lat && city?.lon) {
      return getCityCategoryOverview({ lat: city.lat, lon: city.lon, radiusKm: initialRadius, cityName: city.name });
    }
    return {};
  });

  // Adjust state during render when city changes (React recommended pattern)
  const [prevCityName, setPrevCityName] = useState(city?.name);
  if (city?.name !== prevCityName) {
    setPrevCityName(city?.name);
    setSelectedPlaceId(null);
    setSearchQuery('');
    setSelectedSubCategory('all');
    setOnlyOpenNow(false);
    setVisibleCount(12);
    if (city?.lat && city?.lon) {
      setCategoryCounts(getCityCategoryOverview({ lat: city.lat, lon: city.lon, radiusKm, cityName: city.name }));
    } else {
      setCategoryCounts({});
      setPlaces([]);
      setIsLoading(false);
    }
  }

  const abortControllerRef = useRef(null);

  // Main reactive fetch effect
  useEffect(() => {
    if (!city || !city.lat || !city.lon) {
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    queueMicrotask(() => {
      if (!controller.signal.aborted) {
        setIsLoading(true);
        setError(null);
      }
    });

    getPlacesByCategory({
      categoryId: activeCategory,
      lat: city.lat,
      lon: city.lon,
      radiusKm,
      cityName: city.name,
      signal: controller.signal
    })
      .then((results) => {
        if (!controller.signal.aborted) {
          setPlaces(results);
          setVisibleCount(12);
          setCategoryCounts(prev => {
            const updated = { ...prev, [activeCategory]: results.length };
            const overviewCacheKey = `city_overview_${city.lat.toFixed(3)}_${city.lon.toFixed(3)}_${radiusKm}`;
            storage.setCache(overviewCacheKey, updated, 30 * 60 * 1000);
            return updated;
          });
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted && err.name !== 'AbortError') {
          console.error('Failed to load places:', err);
          setError(err.message || 'Failed to retrieve places for this category.');
          setPlaces([]);
          setIsLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [city, activeCategory, radiusKm, retryCount]);

  // Available subcategories in current results
  const availableSubCategories = useMemo(() => {
    const set = new Set();
    places.forEach(p => {
      if (p.subCategory) set.add(p.subCategory);
    });
    return Array.from(set).sort();
  }, [places]);

  // Filtered and sorted places
  const filteredPlaces = useMemo(() => {
    let result = [...places];

    // Search query filter (matches name, address, or subcategory)
    if (searchQuery.trim()) {
      const term = searchQuery.toLowerCase().trim();
      result = result.filter(p =>
        (p.name && p.name.toLowerCase().includes(term)) ||
        (p.subCategory && p.subCategory.toLowerCase().includes(term)) ||
        (p.address && p.address.toLowerCase().includes(term))
      );
    }

    // Subcategory filter
    if (selectedSubCategory !== 'all') {
      result = result.filter(p => p.subCategory === selectedSubCategory);
    }

    // Open now filter
    if (onlyOpenNow) {
      result = result.filter(p => {
        if (!p.openingHours) return false;
        const h = p.openingHours.toLowerCase();
        return h.includes('24/7') || !h.includes('off');
      });
    }

    // Sorting
    if (sortBy === 'distance') {
      result.sort((a, b) => (a.distance ?? 9999) - (b.distance ?? 9999));
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [places, searchQuery, selectedSubCategory, onlyOpenNow, sortBy]);

  // Visible places for pagination
  const visiblePlaces = useMemo(() => {
    return filteredPlaces.slice(0, visibleCount);
  }, [filteredPlaces, visibleCount]);

  const hasMore = visiblePlaces.length < filteredPlaces.length;

  const loadMore = useCallback(() => {
    setVisibleCount(prev => prev + 12);
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedSubCategory('all');
    setOnlyOpenNow(false);
    setSortBy('distance');
  }, []);

  // Currently selected place object
  const selectedPlace = useMemo(() => {
    if (!selectedPlaceId) return null;
    return places.find(p => p.id === selectedPlaceId) || null;
  }, [places, selectedPlaceId]);

  return {
    activeCategory,
    setActiveCategory: (cat) => {
      setActiveCategory(cat);
      setSelectedSubCategory('all');
      setSelectedPlaceId(null);
    },
    radiusKm,
    setRadiusKm,
    places,
    filteredPlaces,
    visiblePlaces,
    hasMore,
    loadMore,
    isLoading,
    error,
    retry: () => setRetryCount(c => c + 1),
    // Filters & Sorting
    searchQuery,
    setSearchQuery,
    selectedSubCategory,
    setSelectedSubCategory,
    availableSubCategories,
    sortBy,
    setSortBy,
    onlyOpenNow,
    setOnlyOpenNow,
    clearAllFilters,
    // Selection & sync
    selectedPlaceId,
    setSelectedPlaceId,
    selectedPlace,
    // Overview metrics
    categoryCounts,
    isOverviewLoading: false,
    totalPlacesInCity: Object.values(categoryCounts).reduce((a, b) => a + b, 0),
    allCategories: PLACE_CATEGORIES,
  };
}
