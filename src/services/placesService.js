/**
 * Places Discovery Service
 * Queries real OpenStreetMap POIs via high-speed Overpass API with mirror failover,
 * Nominatim fallback, Geoapify support, response normalization, and caching.
 */

import { getCategoryById, deriveSubCategory } from '../utils/placeCategories.js';
import { calculateDistance, formatDistance } from '../utils/distance.js';
import { storage } from '../utils/storage.js';

const ENV = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};

// Distinct Overpass API mirrors with geographic redundancy
const OVERPASS_MIRRORS = [
  ENV.VITE_OVERPASS_API_URL,
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  'https://overpass.private.coffee/api/interpreter'
].filter(Boolean);

const GEOAPIFY_KEY = ENV.VITE_GEOAPIFY_API_KEY || '';

// Optimized compact Overpass QL clauses using 'nw' (node and way) and regex alternation
// This avoids expensive relation geometry resolution and executes 5x-10x faster
const CATEGORY_OVERPASS_CLAUSES = {
  healthcare: [
    'nw["amenity"~"hospital|clinic|pharmacy|doctors|veterinary"]',
    'nw["healthcare"~"hospital|clinic|laboratory|blood_bank"]'
  ],
  education: [
    'nw["amenity"~"school|college|university|library|kindergarten"]'
  ],
  public_safety: [
    'nw["amenity"~"police|fire_station"]',
    'nw["emergency"~"disaster_help_point"]'
  ],
  parks_recreation: [
    'nw["leisure"~"park|garden|playground|pitch|sports_centre|stadium"]',
    'nw["tourism"~"zoo|theme_park"]'
  ],
  government: [
    'nw["amenity"~"townhall|courthouse|post_office|community_centre|public_building"]',
    'nw["office"~"government|administrative"]'
  ],
  transportation: [
    'nw["railway"~"station|subway_entrance"]',
    'nw["amenity"~"bus_station|fuel|charging_station|parking"]',
    'nw["aeroway"~"aerodrome"]'
  ],
  shopping: [
    'nw["shop"~"mall|supermarket|department_store|convenience|general"]',
    'nw["amenity"~"marketplace"]'
  ],
  food_accommodation: [
    'nw["amenity"~"restaurant|cafe|fast_food|food_court"]',
    'nw["tourism"~"hotel|hostel|guest_house"]'
  ],
  banking_utilities: [
    'nw["amenity"~"bank|atm|toilets|drinking_water"]'
  ],
  tourism_culture: [
    'nw["tourism"~"attraction|museum|viewpoint"]',
    'nw["historic"~"monument|memorial|fort|castle"]',
    'nw["amenity"~"place_of_worship"]'
  ]
};

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
    provider: 'OpenStreetMap'
  };
}

/**
 * Builds an optimized Overpass QL query for a category and radius
 */
function buildOverpassQuery(categoryObj, lat, lon, radiusMeters) {
  const clauses = CATEGORY_OVERPASS_CLAUSES[categoryObj.id] ||
    (categoryObj.osmTags || []).slice(0, 4).map(t => `nw${t}`);

  const queryClauses = clauses.map(c => `${c}(around:${radiusMeters},${lat},${lon});`).join('');
  return `[out:json][timeout:10];(${queryClauses});out center 40;`;
}

/**
 * Tries fetching from Overpass API mirrors with fast failover
 */
async function fetchOverpassWithFailover(query, externalSignal = null) {
  let lastError = null;

  for (const mirror of OVERPASS_MIRRORS) {
    if (externalSignal && externalSignal.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5s per mirror for snappy response

      // Merge signals if external signal is provided
      const abortHandler = () => controller.abort();
      if (externalSignal) {
        externalSignal.addEventListener('abort', abortHandler);
      }

      const res = await fetch(mirror, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Accept': 'application/json'
        },
        body: `data=${encodeURIComponent(query)}`,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      if (externalSignal) {
        externalSignal.removeEventListener('abort', abortHandler);
      }

      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.elements)) {
          return data.elements;
        }
      } else {
        console.warn(`Overpass mirror ${mirror} returned status ${res.status}`);
      }
    } catch (err) {
      if (err.name === 'AbortError' && externalSignal && externalSignal.aborted) {
        throw err;
      }
      console.warn(`Overpass mirror ${mirror} failed:`, err.message || err);
      lastError = err;
    }
  }

  throw lastError || new Error('All Overpass API mirrors were unreachable.');
}

const NOMINATIM_CATEGORY_KEYWORDS = {
  healthcare: ['Hospital', 'Clinic', 'Pharmacy'],
  education: ['School', 'College', 'University'],
  public_safety: ['Police Station', 'Fire Station'],
  parks_recreation: ['Park', 'Garden'],
  government: ['Town Hall', 'Post Office', 'Court'],
  transportation: ['Railway Station', 'Bus Station', 'Metro Station'],
  shopping: ['Shopping Mall', 'Supermarket'],
  food_accommodation: ['Restaurant', 'Hotel'],
  banking_utilities: ['Bank', 'ATM'],
  tourism_culture: ['Museum', 'Monument', 'Heritage']
};

/**
 * Fallback to fast amenity search if Overpass is overloaded
 */
async function fetchNominatimCategoryFallback(categoryObj, cityName, lat, lon, radiusKm = 5, signal = null) {
  try {
    const delta = Math.max(0.04, (radiusKm / 111) * 1.3);
    const viewbox = `${lon - delta},${lat + delta},${lon + delta},${lat - delta}`;
    const keywords = NOMINATIM_CATEGORY_KEYWORDS[categoryObj.id] || [categoryObj.label];
    const kw = keywords[0];

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(kw + ' ' + cityName)}&viewbox=${viewbox}&format=json&addressdetails=1&limit=25`;
    const res = await fetch(url, {
      signal: signal || controller.signal,
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'en'
      }
    });
    clearTimeout(timeoutId);

    if (!res.ok) return [];
    const items = await res.json();
    if (!Array.isArray(items)) return [];

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
        provider: 'OpenStreetMap'
      };
    });
  } catch (err) {
    console.warn('Nominatim POI fallback failed:', err.message);
    return [];
  }
}

/**
 * Optional Geoapify Places API provider
 */
async function fetchGeoapifyPlaces(categoryObj, lat, lon, radiusMeters, signal = null) {
  if (!GEOAPIFY_KEY) return [];

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
    const res = await fetch(url, { signal });
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
        provider: 'Geoapify'
      };
    });
  } catch (e) {
    console.warn('Geoapify Places fetch failed:', e);
    return [];
  }
}

/**
 * Fetches real places for a given category and location
 */
export async function getPlacesByCategory({ categoryId, lat, lon, radiusKm = 5, cityName = '', signal = null }) {
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

  // 1. Try Overpass API with optimized 'nw' query
  try {
    const query = buildOverpassQuery(categoryObj, lat, lon, radiusMeters);
    const elements = await fetchOverpassWithFailover(query, signal);

    places = elements
      .map(el => normalizeOverpassElement(el, categoryId, lat, lon))
      .filter(Boolean);
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    console.warn(`Overpass query failed for ${categoryId}:`, err.message);
    fetchError = err;
  }

  // 2. Try Geoapify if configured
  if (places.length === 0 && GEOAPIFY_KEY) {
    try {
      const geoResults = await fetchGeoapifyPlaces(categoryObj, lat, lon, radiusMeters, signal);
      if (geoResults.length > 0) {
        places = geoResults;
        fetchError = null;
      }
    } catch {
      // Continue to next fallback
    }
  }

  // 3. Fallback to Nominatim POI search if still empty
  if (places.length === 0 && cityName) {
    try {
      const nomResults = await fetchNominatimCategoryFallback(categoryObj, cityName, lat, lon, radiusKm, signal);
      if (nomResults.length > 0) {
        places = nomResults;
        fetchError = null;
      }
    } catch {
      // Continue
    }
  }

  // Deduplicate places by ID and proximity (< 20 meters)
  const uniquePlaces = [];
  const seenIds = new Set();

  for (const place of places) {
    if (!place || seenIds.has(place.id)) continue;

    const isDuplicate = uniquePlaces.some(
      existing => calculateDistance(existing.lat, existing.lon, place.lat, place.lon) < 0.02 &&
        existing.name.toLowerCase() === place.name.toLowerCase()
    );

    if (!isDuplicate) {
      seenIds.add(place.id);
      uniquePlaces.push(place);
    }
  }

  // Sort by nearest distance first
  uniquePlaces.sort((a, b) => (a.distance || 0) - (b.distance || 0));

  if (uniquePlaces.length > 0) {
    // Cache results for 20 minutes
    storage.setCache(cacheKey, uniquePlaces, 20 * 60 * 1000);
    return uniquePlaces;
  }

  if (fetchError && uniquePlaces.length === 0) {
    throw new Error(`Unable to load ${categoryObj.label} at this time. (${fetchError.message || 'Server timeout'})`);
  }

  return [];
}

/**
 * Gets overview counts from storage cache or returns existing counts
 * Does NOT spam Overpass API with 10 sequential calls upon city load
 */
export function getCityCategoryOverview({ lat, lon, radiusKm = 5 }) {
  const overviewCacheKey = `city_overview_${lat.toFixed(3)}_${lon.toFixed(3)}_${radiusKm}`;
  return storage.getCache(overviewCacheKey) || {};
}
