/**
 * Geocoding Service
 * Supports Nominatim (OpenStreetMap) and Geoapify Geocoding with fallback, caching,
 * and rate-limit handling.
 */

import { storage } from '../utils/storage.js';

const ENV = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};
const GEOAPIFY_KEY = ENV.VITE_GEOAPIFY_API_KEY || '';
const PREFERRED_PROVIDER = ENV.VITE_GEOCODING_PROVIDER || (GEOAPIFY_KEY ? 'geoapify' : 'nominatim');

// Curated popular Indian cities with verified coordinates
export const POPULAR_CITIES = [
  { name: 'Mumbai', state: 'Maharashtra', country: 'India', lat: 19.0760, lon: 72.8777, displayName: 'Mumbai, Maharashtra, India' },
  { name: 'Delhi', state: 'National Capital Territory of Delhi', country: 'India', lat: 28.6139, lon: 77.2090, displayName: 'New Delhi, Delhi, India' },
  { name: 'Bengaluru', state: 'Karnataka', country: 'India', lat: 12.9716, lon: 77.5946, displayName: 'Bengaluru, Karnataka, India' },
  { name: 'Hyderabad', state: 'Telangana', country: 'India', lat: 17.3850, lon: 78.4867, displayName: 'Hyderabad, Telangana, India' },
  { name: 'Chennai', state: 'Tamil Nadu', country: 'India', lat: 13.0827, lon: 80.2707, displayName: 'Chennai, Tamil Nadu, India' },
  { name: 'Kolkata', state: 'West Bengal', country: 'India', lat: 22.5726, lon: 88.3639, displayName: 'Kolkata, West Bengal, India' },
  { name: 'Pune', state: 'Maharashtra', country: 'India', lat: 18.5204, lon: 73.8567, displayName: 'Pune, Maharashtra, India' },
  { name: 'Jaipur', state: 'Rajasthan', country: 'India', lat: 26.9124, lon: 75.7873, displayName: 'Jaipur, Rajasthan, India' },
  { name: 'Ahmedabad', state: 'Gujarat', country: 'India', lat: 23.0225, lon: 72.5714, displayName: 'Ahmedabad, Gujarat, India' },
  { name: 'Chandigarh', state: 'Chandigarh', country: 'India', lat: 30.7333, lon: 76.7794, displayName: 'Chandigarh, India' },
  { name: 'Kochi', state: 'Kerala', country: 'India', lat: 9.9312, lon: 76.2673, displayName: 'Kochi, Kerala, India' },
  { name: 'Lucknow', state: 'Uttar Pradesh', country: 'India', lat: 26.8467, lon: 80.9462, displayName: 'Lucknow, Uttar Pradesh, India' },
];

/**
 * Normalizes geocoding search results into a clean uniform model
 */
function normalizeNominatimResult(item) {
  const addr = item.address || {};
  const cityName = addr.city || addr.town || addr.municipality || addr.village || addr.county || item.name || 'Unknown Location';
  const state = addr.state || addr.province || addr.region || '';
  const country = addr.country || '';

  return {
    id: `osm_${item.osm_type || 'place'}_${item.osm_id || item.place_id}`,
    name: cityName,
    displayName: item.display_name,
    locality: [cityName, state, country].filter(Boolean).join(', '),
    state: state,
    country: country,
    lat: parseFloat(item.lat),
    lon: parseFloat(item.lon),
    boundingBox: item.boundingbox ? {
      south: parseFloat(item.boundingbox[0]),
      north: parseFloat(item.boundingbox[1]),
      west: parseFloat(item.boundingbox[2]),
      east: parseFloat(item.boundingbox[3]),
    } : null,
    provider: 'OpenStreetMap Nominatim',
  };
}

function normalizeGeoapifyResult(item) {
  const props = item.properties || {};
  const cityName = props.city || props.name || props.county || 'Unknown Location';
  const state = props.state || '';
  const country = props.country || '';

  return {
    id: `geoapify_${props.place_id || item.id || Math.random().toString(36).substring(2)}`,
    name: cityName,
    displayName: props.formatted || `${cityName}, ${state}, ${country}`,
    locality: [cityName, state, country].filter(Boolean).join(', '),
    state: state,
    country: country,
    lat: props.lat || item.geometry?.coordinates?.[1],
    lon: props.lon || item.geometry?.coordinates?.[0],
    boundingBox: props.bbox ? {
      west: props.bbox[0],
      south: props.bbox[1],
      east: props.bbox[2],
      north: props.bbox[3],
    } : null,
    provider: 'Geoapify',
  };
}

/**
 * Searches for locations matching user query
 * @param {string} query 
 * @returns {Promise<Array>} List of normalized locations
 */
export async function searchLocation(query) {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const cleanQuery = query.trim();
  const cacheKey = `geo_search_${cleanQuery.toLowerCase()}`;
  const cached = storage.getCache(cacheKey);
  if (cached) {
    return cached;
  }

  // Check matching popular cities first for instant offline/fast lookup
  const lower = cleanQuery.toLowerCase();
  const popularMatches = POPULAR_CITIES.filter(c =>
    c.name.toLowerCase().includes(lower) ||
    c.displayName.toLowerCase().includes(lower)
  ).map(c => ({
    id: `curated_${c.name.toLowerCase()}`,
    name: c.name,
    displayName: c.displayName,
    locality: `${c.name}, ${c.state}, ${c.country}`,
    state: c.state,
    country: c.country,
    lat: c.lat,
    lon: c.lon,
    provider: 'Curated Verified Index'
  }));

  try {
    let results = [];

    // Try Geoapify if key exists and configured
    if (PREFERRED_PROVIDER === 'geoapify' && GEOAPIFY_KEY) {
      try {
        const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(cleanQuery)}&limit=8&apiKey=${GEOAPIFY_KEY}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data && data.features) {
            results = data.features.map(normalizeGeoapifyResult);
          }
        }
      } catch (e) {
        console.warn('Geoapify geocoding failed, falling back to Nominatim', e);
      }
    }

    // Default or Fallback to OpenStreetMap Nominatim
    if (results.length === 0) {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanQuery)}&addressdetails=1&limit=8`;
      const res = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Accept-Language': 'en',
        }
      });

      if (!res.ok) {
        throw new Error(`Geocoding HTTP error ${res.status}`);
      }

      const data = await res.json();
      if (Array.isArray(data)) {
        results = data.map(normalizeNominatimResult);
      }
    }

    // Combine popular matches if query is exact or starts with it, avoiding duplicates
    const combined = [...popularMatches];
    for (const r of results) {
      if (!combined.some(c => c.name.toLowerCase() === r.name.toLowerCase() || Math.abs(c.lat - r.lat) < 0.05 && Math.abs(c.lon - r.lon) < 0.05)) {
        combined.push(r);
      }
    }

    const finalResults = combined.slice(0, 8);
    // Cache for 1 hour
    storage.setCache(cacheKey, finalResults, 60 * 60 * 1000);
    return finalResults;
  } catch (err) {
    console.error('Error during geocoding search:', err);
    // If external service fails, return any popular matches if available
    if (popularMatches.length > 0) {
      return popularMatches;
    }
    throw new Error('Unable to resolve city name. Please check your internet connection or try a different spelling.');
  }
}

/**
 * Reverse geocodes coordinates into city and location info
 * @param {number} lat 
 * @param {number} lon 
 * @returns {Promise<Object>}
 */
export async function reverseGeocode(lat, lon) {
  const cacheKey = `geo_reverse_${lat.toFixed(3)}_${lon.toFixed(3)}`;
  const cached = storage.getCache(cacheKey);
  if (cached) return cached;

  try {
    if (PREFERRED_PROVIDER === 'geoapify' && GEOAPIFY_KEY) {
      const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${GEOAPIFY_KEY}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data && data.features && data.features.length > 0) {
          const normalized = normalizeGeoapifyResult(data.features[0]);
          storage.setCache(cacheKey, normalized, 60 * 60 * 1000);
          return normalized;
        }
      }
    }

    // Nominatim reverse
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`;
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'en',
      }
    });

    if (!res.ok) {
      throw new Error(`Reverse geocoding error ${res.status}`);
    }

    const data = await res.json();
    const normalized = normalizeNominatimResult(data);
    storage.setCache(cacheKey, normalized, 60 * 60 * 1000);
    return normalized;
  } catch (err) {
    console.error('Reverse geocoding failed:', err);
    return {
      id: `coord_${lat.toFixed(4)}_${lon.toFixed(4)}`,
      name: 'Current Location',
      displayName: `Coordinates: ${lat.toFixed(4)}, ${lon.toFixed(4)}`,
      locality: 'Current Location',
      lat,
      lon,
      provider: 'GPS Coordinates'
    };
  }
}
