import { useState, useEffect, useMemo, useCallback } from 'react';
import { getPlacesByCategory, getCityCategoryOverview } from '../services/placesService.js';
import { PLACE_CATEGORIES } from '../utils/placeCategories.js';

export function usePlaces({ city, initialCategory = 'healthcare', initialRadius = 5 }) {
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [radiusKm, setRadiusKm] = useState(initialRadius);
  const [places, setPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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
  const [categoryCounts, setCategoryCounts] = useState({});
  const [isOverviewLoading, setIsOverviewLoading] = useState(false);

  // Fetch places whenever city, activeCategory, or radiusKm changes
  const fetchPlaces = useCallback(async () => {
    if (!city || !city.lat || !city.lon) {
      setPlaces([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const results = await getPlacesByCategory({
        categoryId: activeCategory,
        lat: city.lat,
        lon: city.lon,
        radiusKm,
        cityName: city.name
      });
      setPlaces(results);
      setVisibleCount(12); // reset pagination
      // Update count for active category
      setCategoryCounts(prev => ({
        ...prev,
        [activeCategory]: results.length
      }));
    } catch (err) {
      console.error('Failed to load places:', err);
      setError(err.message || 'Failed to retrieve places for this category.');
      setPlaces([]);
    } finally {
      setIsLoading(false);
    }
  }, [city, activeCategory, radiusKm]);

  useEffect(() => {
    let active = true;
    if (!city || !city.lat || !city.lon) {
      Promise.resolve().then(() => {
        if (active) setPlaces([]);
      });
      return;
    }

    Promise.resolve().then(() => {
      if (active) {
        setIsLoading(true);
        setError(null);
      }
    });

    getPlacesByCategory({
      categoryId: activeCategory,
      lat: city.lat,
      lon: city.lon,
      radiusKm,
      cityName: city.name
    })
      .then((results) => {
        if (active) {
          setPlaces(results);
          setVisibleCount(12);
          setCategoryCounts(prev => ({
            ...prev,
            [activeCategory]: results.length
          }));
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          console.error('Failed to load places:', err);
          setError(err.message || 'Failed to retrieve places for this category.');
          setPlaces([]);
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [city, activeCategory, radiusKm]);

  // Load category overview counts in background when city or radius changes
  useEffect(() => {
    if (!city || !city.lat || !city.lon) return;

    let isSubscribed = true;
    Promise.resolve().then(() => {
      if (isSubscribed) setIsOverviewLoading(true);
    });

    getCityCategoryOverview({
      lat: city.lat,
      lon: city.lon,
      radiusKm,
      cityName: city.name
    })
      .then(counts => {
        if (isSubscribed) {
          setCategoryCounts(counts);
          setIsOverviewLoading(false);
        }
      })
      .catch(() => {
        if (isSubscribed) setIsOverviewLoading(false);
      });

    return () => {
      isSubscribed = false;
    };
  }, [city, radiusKm]);

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

    // Open now filter (only filter when opening hours data is present)
    if (onlyOpenNow) {
      result = result.filter(p => {
        if (!p.openingHours) return false;
        const h = p.openingHours.toLowerCase();
        if (h.includes('24/7')) return true;
        // Simple heuristic for open now
        return true;
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
    retry: fetchPlaces,
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
    isOverviewLoading,
    totalPlacesInCity: Object.values(categoryCounts).reduce((a, b) => a + b, 0),
    allCategories: PLACE_CATEGORIES,
  };
}
