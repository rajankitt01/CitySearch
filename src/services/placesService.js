/**
 * Places Discovery Service
 * Queries real OpenStreetMap POIs via Overpass API with mirror failover,
 * Nominatim fallback, Geoapify support, response normalization, and caching.
 */

import { PLACE_CATEGORIES, getCategoryById, deriveSubCategory } from '../utils/placeCategories.js';
import { calculateDistance, formatDistance } from '../utils/distance.js';
import { storage } from '../utils/storage.js';

const ENV = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};

const OVERPASS_MIRRORS = [
  ENV.VITE_OVERPASS_API_URL,
  'https://overpass-api.de/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
  'https://z.overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter'
].filter(Boolean);

const GEOAPIFY_KEY = ENV.VITE_GEOAPIFY_API_KEY || '';

/**
 * Normalizes an Overpass API element into our standard place model
 */
function normalizeOverpassElement(element, categoryId, centerLat, centerLon) {
  const tags = element.tags || {};
  const lat = element.lat != null ? element.lat : (element.center ? element.center.lat : null);
  const lon = element.lon != null ? element.lon : (element.center ? element.center.lon : null);

  if (lat == null || lon == null) {
    return null;
  }

  // Determine subCategory and category
  const subCategory = deriveSubCategory(tags, categoryId);

  // Clean place name
  let name = tags.name || tags['name:en'] || tags['official_name'] || tags.brand;
  if (!name || name.trim().length < 2) {
    // Meaningful description when name tag is absent or a single letter
    const operator = tags.operator ? ` (${tags.operator})` : '';
    name = `${subCategory}${operator}`;
  }

  // Address assembly
  const addressParts = [
    tags['addr:housenumber'] ? `${tags['addr:housenumber']} ` : '',
    tags['addr:street'],
    tags['addr:suburb'] || tags['addr:neighbourhood'],
    tags['addr:city'] || tags['addr:district'],
    tags['addr:postcode']
  ].filter(Boolean);

  const address = addressParts.length > 0
    ? addressParts.join(', ')
    : (tags['addr:full'] || tags.locality || 'Address details not mapped');

  // Contact & details
  const phone = tags.phone || tags['contact:phone'] || tags['contact:mobile'] || null;
  let website = tags.website || tags['contact:website'] || tags['url'] || null;
  if (website && !website.startsWith('http://') && !website.startsWith('https://')) {
    website = `https://${website}`;
  }

  const openingHours = tags.opening_hours || null;
  const operator = tags.operator || null;
  const wheelchair = tags.wheelchair || null;

  const distKm = centerLat != null && centerLon != null
    ? calculateDistance(centerLat, centerLon, lat, lon)
    : null;

  return {
    id: `osm_${element.type || 'node'}_${element.id}`,
    osmId: element.id,
    osmType: element.type || 'node',
    name: name.trim(),
    category: categoryId,
    subCategory,
    lat,
    lon,
    distance: distKm,
    formattedDistance: formatDistance(distKm),
    address,
    phone,
    website,
    openingHours,
    operator,
    wheelchair,
    rawTags: tags,
    provider: 'OpenStreetMap (Overpass API)'
  };
}

/**
 * Builds an Overpass QL query for a category and radius
 */
function buildOverpassQuery(categoryObj, lat, lon, radiusMeters) {
  const clauses = [];
  const tags = (categoryObj.osmTags || []).slice(0, 6);

  tags.forEach(tagClause => {
    clauses.push(`nwr${tagClause}(around:${radiusMeters},${lat},${lon});`);
  });

  return `[out:json][timeout:15];(${clauses.join('')});out center 50;`;
}

/**
 * Tries fetching from Overpass API mirrors with timeout
 */
async function fetchOverpassWithFailover(query) {
  let lastError = null;

  for (const mirror of OVERPASS_MIRRORS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7500); // 7.5 second timeout for fast failover

      const res = await fetch(mirror, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Accept': 'application/json',
          'User-Agent': 'CitySearch/1.0 (https://citysearch.org)'
        },
        body: `data=${encodeURIComponent(query)}`,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.elements)) {
          return data.elements;
        }
      } else {
        console.warn(`Overpass mirror ${mirror} returned status ${res.status}`);
      }
    } catch (err) {
      console.warn(`Overpass mirror ${mirror} failed:`, err.message || err);
      lastError = err;
    }
  }

  throw lastError || new Error('All Overpass API mirrors were unreachable.');
}

const NOMINATIM_CATEGORY_KEYWORDS = {
  healthcare: ['Hospital', 'Clinic', 'Pharmacy'],
  education: ['School', 'College', 'University'],
  public_safety: ['Police', 'Fire Station'],
  parks_recreation: ['Park', 'Garden'],
  government: ['Town Hall', 'Government', 'Post Office'],
  transportation: ['Railway Station', 'Bus Station', 'Metro Station'],
  shopping: ['Mall', 'Supermarket', 'Market'],
  food_accommodation: ['Restaurant', 'Hotel'],
  banking_utilities: ['Bank', 'ATM'],
  tourism_culture: ['Museum', 'Monument', 'Fort', 'Temple', 'Heritage']
};

/**
 * Fallback to Nominatim amenity search if Overpass is overloaded
 */
async function fetchNominatimCategoryFallback(categoryObj, cityName, lat, lon, radiusKm = 5) {
  try {
    const delta = Math.max(0.04, (radiusKm / 111) * 1.3);
    const viewbox = `${lon - delta},${lat + delta},${lon + delta},${lat - delta}`;
    const keywords = NOMINATIM_CATEGORY_KEYWORDS[categoryObj.id] || [categoryObj.label];

    // Query primary keywords concurrently
    const requests = keywords.slice(0, 2).map(async (kw) => {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(kw)}&viewbox=${viewbox}&bounded=1&format=json&addressdetails=1&limit=15`;
      const res = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'CitySearch/1.0 (https://citysearch.org)'
        }
      });
      if (!res.ok) return [];
      const json = await res.json();
      return Array.isArray(json) ? json : [];
    });

    const results = await Promise.all(requests);
    let items = results.flat();

    // If bounded viewbox returned 0 results, fallback to query string with city name
    if (items.length === 0) {
      const kw = keywords[0];
      const fallbackUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(kw + ' in ' + cityName)}&format=json&addressdetails=1&limit=20`;
      const res = await fetch(fallbackUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'CitySearch/1.0'
        }
      });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json)) items = json;
      }
    }

    if (items.length === 0) return [];

    return items.map(item => {
      const itemLat = parseFloat(item.lat);
      const itemLon = parseFloat(item.lon);
      const dist = calculateDistance(lat, lon, itemLat, itemLon);

      return {
        id: `nominatim_${item.place_id || item.osm_id}`,
        osmId: item.osm_id,
        osmType: item.osm_type || 'node',
        name: item.name || item.display_name.split(',')[0],
        category: categoryObj.id,
        subCategory: deriveSubCategory({ amenity: item.type }, categoryObj.id),
        lat: itemLat,
        lon: itemLon,
        distance: dist,
        formattedDistance: formatDistance(dist),
        address: item.display_name,
        phone: null,
        website: null,
        openingHours: null,
        operator: null,
        wheelchair: null,
        rawTags: item.address || {},
        provider: 'OpenStreetMap (Nominatim)'
      };
    });
  } catch (err) {
    console.warn('Nominatim POI fallback failed:', err);
    return [];
  }
}

/**
 * Optional Geoapify Places API provider
 */
async function fetchGeoapifyPlaces(categoryObj, lat, lon, radiusMeters) {
  if (!GEOAPIFY_KEY) return [];

  // Map category to Geoapify categories
  const geoCategoryMap = {
    healthcare: 'healthcare',
    education: 'education',
    public_safety: 'service.police,service.fire',
    parks_recreation: 'leisure.park,entertainment.museum',
    government: 'building.public_and_civil,service',
    transportation: 'public_transport,parking,service.vehicle',
    shopping: 'commercial.supermarket,commercial.shopping_mall',
    food_accommodation: 'catering,accommodation',
    banking_utilities: 'service.financial',
    tourism_culture: 'tourism,heritage',
  };

  const geoCat = geoCategoryMap[categoryObj.id] || 'commercial';
  const url = `https://api.geoapify.com/v2/places?categories=${geoCat}&filter=circle:${lon},${lat},${radiusMeters}&limit=40&apiKey=${GEOAPIFY_KEY}`;

  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    if (!data || !data.features) return [];

    return data.features.map(f => {
      const p = f.properties || {};
      const itemLat = p.lat || f.geometry?.coordinates?.[1];
      const itemLon = p.lon || f.geometry?.coordinates?.[0];
      const dist = calculateDistance(lat, lon, itemLat, itemLon);

      return {
        id: `geoapify_${p.place_id || Math.random().toString(36).substring(2)}`,
        name: p.name || `${categoryObj.label} Location`,
        category: categoryObj.id,
        subCategory: p.categories?.[0]?.split('.')?.[1] || categoryObj.label,
        lat: itemLat,
        lon: itemLon,
        distance: dist,
        formattedDistance: formatDistance(dist),
        address: p.formatted || p.address_line2 || 'Address available',
        phone: p.contact?.phone || null,
        website: p.website || null,
        openingHours: p.opening_hours || null,
        operator: p.operator || null,
        wheelchair: p.wheelchair || null,
        rawTags: p,
        provider: 'Geoapify Places API'
      };
    });
  } catch (e) {
    console.warn('Geoapify Places fetch failed:', e);
    return [];
  }
}

/**
 * Fetches real places for a given category and location
 * @param {Object} params
 * @param {string} params.categoryId
 * @param {number} params.lat
 * @param {number} params.lon
 * @param {number} params.radiusKm
 * @param {string} [params.cityName]
 * @returns {Promise<Array>} List of normalized places
 */
export async function getPlacesByCategory({ categoryId, lat, lon, radiusKm = 5, cityName = '' }) {
  const categoryObj = getCategoryById(categoryId);
  if (!categoryObj) {
    throw new Error(`Invalid category ID: ${categoryId}`);
  }

  const radiusMeters = Math.min(Math.max(radiusKm, 1), 25) * 1000;
  const cacheKey = `places_${categoryId}_${lat.toFixed(3)}_${lon.toFixed(3)}_${radiusMeters}`;
  const cached = storage.getCache(cacheKey);

  if (cached && Array.isArray(cached) && cached.length > 0) {
    return cached;
  }

  let places = [];
  let fetchError = null;

  // 1. Try Overpass API mirrors
  try {
    const query = buildOverpassQuery(categoryObj, lat, lon, radiusMeters);
    const elements = await fetchOverpassWithFailover(query);

    places = elements
      .map(el => normalizeOverpassElement(el, categoryId, lat, lon))
      .filter(Boolean);
  } catch (err) {
    console.warn(`Overpass query failed for ${categoryId}:`, err.message);
    fetchError = err;
  }

  // 2. If Overpass failed or returned very few results and Geoapify is configured, try Geoapify
  if (places.length === 0 && GEOAPIFY_KEY) {
    try {
      const geoResults = await fetchGeoapifyPlaces(categoryObj, lat, lon, radiusMeters);
      if (geoResults.length > 0) {
        places = geoResults;
        fetchError = null;
      }
    } catch (e) {
      console.warn('Geoapify fallback error:', e);
    }
  }

  // 3. If still empty and an error occurred, try Nominatim amenity fallback
  if (places.length === 0 && cityName) {
    try {
      const nomResults = await fetchNominatimCategoryFallback(categoryObj, cityName, lat, lon, radiusKm);
      if (nomResults.length > 0) {
        places = nomResults;
        fetchError = null;
      }
    } catch (e) {
      console.warn('Nominatim fallback error:', e);
    }
  }

  // Deduplicate places by ID and close coordinates (< 15 meters)
  const uniquePlaces = [];
  const seenIds = new Set();

  for (const place of places) {
    if (!place || seenIds.has(place.id)) continue;

    // Proximity deduplication
    const isDuplicate = uniquePlaces.some(
      existing => calculateDistance(existing.lat, existing.lon, place.lat, place.lon) < 0.015 &&
        existing.name.toLowerCase() === place.name.toLowerCase()
    );

    if (!isDuplicate) {
      seenIds.add(place.id);
      uniquePlaces.push(place);
    }
  }

  // Sort by distance from city center by default
  uniquePlaces.sort((a, b) => (a.distance || 0) - (b.distance || 0));

  if (uniquePlaces.length > 0) {
    // Cache results for 15 minutes
    storage.setCache(cacheKey, uniquePlaces, 15 * 60 * 1000);
    return uniquePlaces;
  }

  if (fetchError && uniquePlaces.length === 0) {
    throw new Error(`Unable to load ${categoryObj.label} at this time. (${fetchError.message || 'API Timeout'})`);
  }

  return [];
}

/**
 * Fetches place counts for all categories in a city for the overview summary
 * @param {Object} params 
 * @returns {Promise<Object>} Map of categoryId -> count
 */
export async function getCityCategoryOverview({ lat, lon, radiusKm = 5, cityName = '' }) {
  const overviewCacheKey = `city_overview_${lat.toFixed(3)}_${lon.toFixed(3)}_${radiusKm}`;
  const cached = storage.getCache(overviewCacheKey);
  if (cached) return cached;

  const counts = {};
  
  // We fetch counts sequentially or small batches to respect public API rate limits
  for (const cat of PLACE_CATEGORIES) {
    try {
      const results = await getPlacesByCategory({
        categoryId: cat.id,
        lat,
        lon,
        radiusKm,
        cityName
      });
      counts[cat.id] = results.length;
    } catch (err) {
      console.warn(`Could not get count for category ${cat.id}:`, err.message);
      counts[cat.id] = 0;
    }
  }

  storage.setCache(overviewCacheKey, counts, 15 * 60 * 1000);
  return counts;
}
