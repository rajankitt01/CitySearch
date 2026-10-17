import React, { useState } from 'react';
import { 
  X, 
  Bookmark, 
  Trash2, 
  Navigation, 
  Search
} from 'lucide-react';
import { getCategoryById } from '../utils/placeCategories.js';

export function FavoritesModal({
  favorites = [],
  onClose,
  onRemoveFavorite,
  onClearAll,
  onSelectPlace
}) {
  const [filterQuery, setFilterQuery] = useState('');

  const filtered = favorites.filter(f =>
    f.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    (f.address && f.address.toLowerCase().includes(filterQuery.toLowerCase())) ||
    (f.subCategory && f.subCategory.toLowerCase().includes(filterQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-500 dark:bg-amber-950/50">
              <Bookmark className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <span>Saved Places</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                  {favorites.length}
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Your bookmarked locations stored securely in your browser
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {favorites.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-xs text-slate-400 hover:text-rose-500 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
                title="Clear all saved places"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear All</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter input if multiple favorites */}
        {favorites.length > 3 && (
          <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Search saved places..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>
        )}

        {/* Places List */}
        <div className="p-5 overflow-y-auto flex-1 divide-y divide-slate-100 dark:divide-slate-800 space-y-3">
          {favorites.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <Bookmark className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-700 dark:text-slate-300">
                No saved places yet
              </h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Click the bookmark icon on any place card or map popup to keep it handy here.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No places match your search filter.
            </div>
          ) : (
            filtered.map((place) => {
              const category = getCategoryById(place.category);
              const color = category ? category.markerColor : '#3b82f6';
              const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}`;

              return (
                <div
                  key={place.id}
                  className="pt-3 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${color}15`,
                          color: color
                        }}
                      >
                        {place.subCategory || category?.label}
                      </span>
                      {place.formattedDistance && (
                        <span className="text-[11px] font-medium text-slate-400">
                          {place.formattedDistance}
                        </span>
                      )}
                    </div>

                    <h4 
                      onClick={() => {
                        onClose();
                        onSelectPlace(place);
                      }}
                      className="font-bold text-sm text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 cursor-pointer truncate"
                    >
                      {place.name}
                    </h4>

                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {place.address}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href={directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Navigation className="w-3.5 h-3.5 text-brand-500" />
                      <span>Directions</span>
                    </a>

                    <button
                      onClick={() => onRemoveFavorite(place.id)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Remove from favorites"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
