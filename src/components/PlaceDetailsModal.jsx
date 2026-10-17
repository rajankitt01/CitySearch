import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Navigation, 
  Phone, 
  Globe, 
  Clock, 
  Bookmark, 
  Share2, 
  AlertTriangle, 
  ExternalLink, 
  Check, 
  Database,
  Building,
  Accessibility
} from 'lucide-react';
import { getCategoryById } from '../utils/placeCategories.js';
import { copyToClipboard, getShareableUrl } from '../utils/share.js';
import { useToast } from '../hooks/useToast.js';

export function PlaceDetailsModal({
  place,
  onClose,
  isFavorite,
  onToggleFavorite,
  onReportPlace,
  cityName
}) {
  const [showRawTags, setShowRawTags] = useState(false);
  const [copied, setCopied] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!place) return null;

  const category = getCategoryById(place.category);
  const color = category ? category.markerColor : '#3b82f6';
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}`;
  const osmUrl = place.osmId 
    ? `https://www.openstreetmap.org/${place.osmType || 'node'}/${place.osmId}`
    : `https://www.openstreetmap.org/#map=17/${place.lat}/${place.lon}`;

  const handleShare = async () => {
    const shareUrl = getShareableUrl({
      city: cityName,
      lat: place.lat,
      lon: place.lon,
      category: place.category,
      placeId: place.id
    });

    const success = await copyToClipboard(shareUrl);
    if (success) {
      setCopied(true);
      addToast('Direct link to this place copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border"
              style={{
                backgroundColor: `${color}15`,
                color: color,
                borderColor: `${color}30`
              }}
            >
              {place.subCategory || category?.label}
            </span>

            {place.formattedDistance && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {place.formattedDistance} from center
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onToggleFavorite(place)}
              className={`p-2 rounded-xl border transition-colors ${
                isFavorite
                  ? 'bg-amber-50 border-amber-300 text-amber-500 dark:bg-amber-950/50 dark:border-amber-700'
                  : 'bg-white border-slate-200 text-slate-400 hover:text-amber-500 dark:bg-slate-800 dark:border-slate-700'
              }`}
              title={isFavorite ? 'Remove from saved' : 'Save place'}
            >
              <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-brand-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Share place link"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-1"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-5">
          {/* Title & Address */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
              {place.name}
            </h2>
            <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400 mt-2">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>{place.address}</span>
            </div>
          </div>

          {/* Key Facts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Phone */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                <Phone className="w-3.5 h-3.5 text-brand-500" />
                Phone Number
              </span>
              {place.phone ? (
                <a 
                  href={`tel:${place.phone}`} 
                  className="text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline break-all"
                >
                  {place.phone}
                </a>
              ) : (
                <span className="text-xs text-slate-400 italic">Not listed by provider</span>
              )}
            </div>

            {/* Hours */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                <Clock className="w-3.5 h-3.5 text-emerald-500" />
                Opening Hours
              </span>
              {place.openingHours ? (
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {place.openingHours}
                </span>
              ) : (
                <span className="text-xs text-slate-400 italic">Hours not specified</span>
              )}
            </div>

            {/* Website */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                <Globe className="w-3.5 h-3.5 text-indigo-500" />
                Website
              </span>
              {place.website ? (
                <a
                  href={place.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1 truncate max-w-full"
                >
                  <span>Visit website</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              ) : (
                <span className="text-xs text-slate-400 italic">No website available</span>
              )}
            </div>

            {/* Coordinates */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                <Navigation className="w-3.5 h-3.5 text-cyan-500" />
                Exact Coordinates
              </span>
              <span className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300">
                {place.lat.toFixed(5)}, {place.lon.toFixed(5)}
              </span>
            </div>
          </div>

          {/* Operator or Wheelchair if present */}
          {(place.operator || place.wheelchair) && (
            <div className="flex flex-wrap gap-2 text-xs">
              {place.operator && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span>Operator: <strong>{place.operator}</strong></span>
                </div>
              )}
              {place.wheelchair && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  <Accessibility className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Wheelchair: <strong>{place.wheelchair}</strong></span>
                </div>
              )}
            </div>
          )}

          {/* OSM Source Attribution link */}
          <div className="p-3.5 rounded-2xl bg-brand-50/50 dark:bg-brand-950/20 border border-brand-200/50 dark:border-brand-900/40 text-xs flex items-center justify-between text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-brand-600" />
              <span>Source: <strong>{place.provider}</strong></span>
            </div>
            <a
              href={osmUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-600 dark:text-brand-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              <span>View on OSM</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Expandable Raw Tags */}
          {place.rawTags && Object.keys(place.rawTags).length > 0 && (
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowRawTags(!showRawTags)}
                className="w-full text-left px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <span>Inspected OpenStreetMap Tags ({Object.keys(place.rawTags).length})</span>
                <span className="text-slate-400 font-mono">{showRawTags ? '▲ Hide' : '▼ View'}</span>
              </button>

              {showRawTags && (
                <div className="p-4 bg-slate-900 text-slate-200 text-xs font-mono max-h-48 overflow-y-auto space-y-1">
                  {Object.entries(place.rawTags).map(([k, v]) => (
                    <div key={k} className="flex">
                      <span className="text-brand-400 w-36 shrink-0 truncate">{k}:</span>
                      <span className="text-slate-200 break-all">{String(v)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => {
              onClose();
              onReportPlace(place);
            }}
            className="w-full sm:w-auto text-xs font-medium text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 flex items-center justify-center gap-1 transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Report Incorrect Details</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-md shadow-brand-500/20 transition-all"
            >
              <Navigation className="w-4 h-4" />
              <span>Get Directions</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
