import React, { useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, Bookmark, Info } from 'lucide-react';
import { getCategoryById } from '../utils/placeCategories.js';

// SVG icons for each category to render inside the Leaflet DivIcon
const CATEGORY_SVG_PATHS = {
  healthcare: '<path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/>',
  education: '<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>',
  public_safety: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>',
  parks_recreation: '<path d="M10 10v.2A3 3 0 0 1 8.9 16H5a3 3 0 0 1-1-5.8V10a3 3 0 0 1 6 0Z"/><path d="M7 16v6"/><path d="M13 19v3"/><path d="M12 19h8.3a1 1 0 0 0 .7-1.7L18 14h.3a1 1 0 0 0 .7-1.7L16 9h.2a1 1 0 0 0 .8-1.7L13 3l-1.4 1.9"/>',
  government: '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>',
  transportation: '<path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4-.2-.8-.6-.8H2"/><path d="M4 18v3"/><path d="M16 18v3"/><path d="M2 6h16a3 3 0 0 1 3 3v9H2V6Z"/>',
  shopping: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  food_accommodation: '<path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2"/><path d="M15 2v14"/><path d="M4 2v18"/><path d="M4 10h4a2 2 0 0 0 2-2V2"/>',
  banking_utilities: '<line x1="3" x2="21" y1="22" y2="22"/><line x1="6" x2="6" y1="18"/><line x1="10" x2="10" y1="18"/><line x1="14" x2="14" y1="18"/><line x1="18" x2="18" y1="18"/><polygon points="12 2 20 7 4 7"/><line x1="1" x2="23" y1="7" y2="7"/>',
  tourism_culture: '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
};

export function MapMarker({
  place,
  isSelected,
  onSelect,
  onViewDetails,
  isFavorite,
  onToggleFavorite
}) {
  const category = getCategoryById(place.category);
  const color = category ? category.markerColor : '#3b82f6';
  const svgPath = CATEGORY_SVG_PATHS[place.category] || CATEGORY_SVG_PATHS.healthcare;

  // Custom DivIcon for crisp retina rendering
  const icon = useMemo(() => {
    const size = isSelected ? 42 : 34;
    const pulseHtml = isSelected
      ? `<div class="custom-pin-pulse" style="background-color: ${color}40;"></div>`
      : '';

    const html = `
      <div class="custom-pin ${isSelected ? 'selected' : ''}" style="
        width: ${size}px;
        height: ${size}px;
        background-color: ${color};
        border: 2.5px solid #ffffff;
      ">
        ${pulseHtml}
        <svg xmlns="http://www.w3.org/2000/svg" width="${isSelected ? 20 : 16}" height="${isSelected ? 20 : 16}" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          ${svgPath}
        </svg>
      </div>
    `;

    return L.divIcon({
      html,
      className: 'custom-map-marker-wrapper',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -size / 2 - 4],
    });
  }, [color, svgPath, isSelected]);

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}`;

  return (
    <Marker
      position={[place.lat, place.lon]}
      icon={icon}
      eventHandlers={{
        click: () => onSelect(place.id),
      }}
    >
      <Popup className="custom-leaflet-popup">
        <div className="p-3 max-w-[260px] text-slate-800 dark:text-slate-100">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <span
              className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: `${color}20`,
                color: color,
              }}
            >
              {place.subCategory || category?.label}
            </span>
            {place.formattedDistance && (
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                {place.formattedDistance} away
              </span>
            )}
          </div>

          <h4 className="font-bold text-sm leading-tight text-slate-900 dark:text-white mb-1 line-clamp-2">
            {place.name}
          </h4>

          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
            {place.address}
          </p>

          <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => onViewDetails(place)}
              className="flex-1 py-1.5 px-2 rounded-lg bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/60 dark:hover:bg-brand-900 text-brand-700 dark:text-brand-300 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
            >
              <Info className="w-3.5 h-3.5" />
              <span>Details</span>
            </button>

            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
              title="Get directions"
            >
              <Navigation className="w-3.5 h-3.5 text-brand-500" />
              <span>Go</span>
            </a>

            <button
              onClick={() => onToggleFavorite(place)}
              className={`p-1.5 rounded-lg border transition-colors ${
                isFavorite
                  ? 'bg-amber-50 border-amber-300 text-amber-500 dark:bg-amber-950/50 dark:border-amber-700'
                  : 'bg-white border-slate-200 text-slate-400 hover:text-amber-500 dark:bg-slate-800 dark:border-slate-700'
              }`}
              title={isFavorite ? 'Remove from saved' : 'Save place'}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
