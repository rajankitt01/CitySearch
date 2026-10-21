/**
 * Utility for shareable URLs and clipboard operations
 */

import { POPULAR_CITIES } from '../services/geocodingService.js';

export function getShareableUrl({ city, lat, lon, category, radius, placeId }) {
  const origin = typeof window !== 'undefined' && window.location ? window.location.origin : 'http://localhost';
  const pathname = typeof window !== 'undefined' && window.location ? window.location.pathname : '/';
  const url = new URL(origin + pathname);
  if (city) url.searchParams.set('city', city);
  if (lat != null) url.searchParams.set('lat', lat);
  if (lon != null) url.searchParams.set('lon', lon);
  if (category && category !== 'all') url.searchParams.set('cat', category);
  if (radius) url.searchParams.set('radius', radius);
  if (placeId) url.searchParams.set('place', placeId);

  return url.toString();
}

export function parseUrlParams() {
  if (typeof window === 'undefined' || !window.location) {
    return {
      city: null,
      lat: null,
      lon: null,
      category: 'healthcare',
      radius: 5,
      placeId: null,
      hasCity: false
    };
  }

  const params = new URLSearchParams(window.location.search);
  const city = params.get('city') || null;
  let lat = params.get('lat') ? parseFloat(params.get('lat')) : null;
  let lon = params.get('lon') ? parseFloat(params.get('lon')) : null;
  const category = params.get('cat') || 'healthcare';
  const radius = params.get('radius') ? parseInt(params.get('radius'), 10) : 5;
  const placeId = params.get('place') || null;

  // If city name is present but lat/lon missing, auto-resolve from popular cities
  if (city && (lat == null || lon == null || Number.isNaN(lat) || Number.isNaN(lon))) {
    const matched = POPULAR_CITIES.find(c => c.name.toLowerCase() === city.toLowerCase());
    if (matched) {
      lat = matched.lat;
      lon = matched.lon;
    }
  }

  return {
    city,
    lat,
    lon,
    category,
    radius,
    placeId,
    hasCity: !!(city && lat != null && lon != null && !Number.isNaN(lat) && !Number.isNaN(lon))
  };
}

export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers or non-secure contexts
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      textArea.remove();
      return successful;
    }
  } catch (err) {
    console.warn('Failed to copy to clipboard', err);
    return false;
  }
}
