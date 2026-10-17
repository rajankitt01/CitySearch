import React, { useRef, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Navigation, 
  Clock, 
  Trash2, 
  AlertCircle, 
  Loader2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export function CitySearch({
  query,
  setQuery,
  suggestions,
  isSearching,
  isLocating,
  searchError,
  recentSearches,
  popularCities,
  onSelectCity,
  onExecuteSearch,
  onLocateUser,
  onClearHistory,
  onClearSuggestions
}) {
  const dropdownRef = useRef(null);

  // Close suggestions if user clicks outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClearSuggestions();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClearSuggestions]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onExecuteSearch(query);
  };

  return (
    <div className="w-full relative">
      {/* Search Input Box */}
      <form onSubmit={handleSubmit} className="relative z-30">
        <div className="relative flex items-center shadow-lg hover:shadow-xl transition-shadow rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-transparent">
          <div className="pl-3.5 pr-2 text-slate-400 dark:text-slate-500">
            {isSearching ? (
              <Loader2 className="w-5 h-5 animate-spin text-brand-500" />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search any city, town, or locality (e.g. Pune, Mumbai, Jaipur)..."
            className="w-full py-3.5 px-2 bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-base font-medium focus:outline-none"
            aria-label="City search input"
            autoComplete="off"
          />

          {/* Quick Clear or Locate Me Button */}
          <div className="flex items-center gap-1.5 pr-1">
            <button
              type="button"
              onClick={onLocateUser}
              disabled={isLocating}
              title="Use my current GPS location"
              className="flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700"
            >
              {isLocating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-500" />
              ) : (
                <Navigation className="w-3.5 h-3.5 text-brand-500" />
              )}
              <span className="hidden sm:inline">Use Location</span>
            </button>

            <button
              type="submit"
              disabled={isSearching || !query.trim()}
              className="flex items-center gap-1.5 px-5 py-3 text-sm font-semibold rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white shadow-md shadow-brand-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              <span>Explore</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>

      {/* Autocomplete Suggestions Dropdown */}
      {suggestions.length > 0 && (
        <div 
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 divide-y divide-slate-100 dark:divide-slate-800 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Resolved Locations</span>
            <span>{suggestions.length} results</span>
          </div>

          <div className="max-h-72 overflow-y-auto">
            {suggestions.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectCity(item)}
                className="w-full text-left px-4 py-3 hover:bg-brand-50 dark:hover:bg-brand-950/40 flex items-start gap-3 transition-colors group"
              >
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-brand-500 group-hover:text-white transition-colors shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                    <span>{item.name}</span>
                    {item.state && (
                      <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                        ({item.state})
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {item.displayName}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error alert if search failed */}
      {searchError && (
        <div className="mt-3 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-sm flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
          <span className="flex-1">{searchError}</span>
        </div>
      )}

      {/* Suggested Popular Cities in India */}
      <div className="mt-5">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Popular Indian Cities
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {popularCities.map((city) => (
            <button
              key={city.name}
              type="button"
              onClick={() => onSelectCity(city)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white dark:bg-slate-800/80 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-950/50 dark:hover:text-brand-300 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:-translate-y-0.5"
            >
              {city.name}
            </button>
          ))}
        </div>
      </div>

      {/* Recently Searched Cities */}
      {recentSearches && recentSearches.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Recently Searched
            </span>
            <button
              type="button"
              onClick={onClearHistory}
              className="text-xs text-slate-400 hover:text-rose-500 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear History</span>
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((city) => (
              <button
                key={city.id || `${city.name}-${city.lat}`}
                type="button"
                onClick={() => onSelectCity(city)}
                className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center gap-1.5 transition-colors"
              >
                <MapPin className="w-3 h-3 text-brand-500" />
                <span>{city.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
