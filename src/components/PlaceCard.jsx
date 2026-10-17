import React from 'react';
import { 
  MapPin, 
  Navigation, 
  Phone, 
  Globe, 
  Clock, 
  Bookmark, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { getCategoryById } from '../utils/placeCategories.js';

export function PlaceCard({
  place,
  isSelected,
  onSelect,
  onViewDetails,
  isFavorite,
  onToggleFavorite
}) {
  const category = getCategoryById(place.category);
  const color = category ? category.markerColor : '#3b82f6';
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}`;

  return (
    <div
      onClick={() => onSelect(place.id)}
      className={`group relative rounded-2xl p-4 transition-all duration-200 border cursor-pointer ${
        isSelected
          ? 'bg-brand-50/70 dark:bg-brand-950/40 border-brand-500 shadow-md ring-2 ring-brand-500/30'
          : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-card shadow-sm'
      }`}
    >
      {/* Top Header: Badge, Distance & Bookmark */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border transition-colors"
            style={{
              backgroundColor: `${color}15`,
              color: color,
              borderColor: `${color}30`
            }}
          >
            {place.subCategory || category?.label}
          </span>

          {place.formattedDistance && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {place.formattedDistance}
            </span>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(place);
          }}
          className={`p-1.5 rounded-xl border transition-all active:scale-90 ${
            isFavorite
              ? 'bg-amber-50 border-amber-300 text-amber-500 dark:bg-amber-950/50 dark:border-amber-700'
              : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700'
          }`}
          title={isFavorite ? 'Remove from saved' : 'Save to favorites'}
          aria-label="Save to favorites"
        >
          <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Place Name */}
      <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors mb-1.5">
        {place.name}
      </h3>

      {/* Address */}
      <div className="flex items-start gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-3">
        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
        <span className="line-clamp-2 leading-relaxed">{place.address}</span>
      </div>

      {/* Verified Meta details (Phone, Website, Opening Hours) - ONLY when available */}
      <div className="flex flex-wrap gap-2 text-xs mb-3.5">
        {place.phone ? (
          <a
            href={`tel:${place.phone}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors"
            title="Call place"
          >
            <Phone className="w-3 h-3 text-brand-500" />
            <span className="truncate max-w-[140px]">{place.phone}</span>
          </a>
        ) : null}

        {place.openingHours ? (
          <span 
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-medium"
            title={`Hours: ${place.openingHours}`}
          >
            <Clock className="w-3 h-3 text-emerald-500" />
            <span className="truncate max-w-[140px]">{place.openingHours}</span>
          </span>
        ) : null}

        {place.website ? (
          <a
            href={place.website}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors"
            title="Official Website"
          >
            <Globe className="w-3 h-3 text-brand-500" />
            <span>Website</span>
            <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
          </a>
        ) : null}
      </div>

      {/* Card Action Footer */}
      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Get Directions</span>
        </a>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(place);
          }}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <span>View Details</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
