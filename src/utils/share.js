/**
 * Utility for shareable URLs and clipboard operations
 */

export function getShareableUrl({ city, lat, lon, category, radius, placeId }) {
  const url = new URL(window.location.origin + window.location.pathname);
  if (city) url.searchParams.set('city', city);
  if (lat) url.searchParams.set('lat', lat);
  if (lon) url.searchParams.set('lon', lon);
  if (category && category !== 'all') url.searchParams.set('cat', category);
  if (radius) url.searchParams.set('radius', radius);
  if (placeId) url.searchParams.set('place', placeId);

  return url.toString();
}

export function parseUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const city = params.get('city') || null;
  const lat = params.get('lat') ? parseFloat(params.get('lat')) : null;
  const lon = params.get('lon') ? parseFloat(params.get('lon')) : null;
  const category = params.get('cat') || 'healthcare';
  const radius = params.get('radius') ? parseInt(params.get('radius'), 10) : 5;
  const placeId = params.get('place') || null;

  return {
    city,
    lat,
    lon,
    category,
    radius,
    placeId,
    hasCity: !!(city && lat && lon)
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
