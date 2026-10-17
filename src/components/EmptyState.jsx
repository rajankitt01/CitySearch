import React from 'react';
import { SearchX, SlidersHorizontal, RefreshCw, Compass } from 'lucide-react';

export function EmptyState({
  title = 'No places found',
  description = 'No mapped places found matching your current filters or selected radius.',
  onClearFilters,
  onIncreaseRadius,
  onRetry,
  currentRadius = 5
}) {
  return (
    <div className="w-full p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-center flex flex-col items-center justify-center space-y-4">
      <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 shadow-inner">
        <SearchX className="w-8 h-8" />
      </div>

      <div className="max-w-md space-y-1">
        <h3 className="font-bold text-lg text-slate-900 dark:text-white">
          {title}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
        {onIncreaseRadius && currentRadius < 25 && (
          <button
            onClick={onIncreaseRadius}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-md shadow-brand-500/20 transition-all"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Expand Radius ({currentRadius < 10 ? '10 km' : '25 km'})</span>
          </button>
        )}

        {onClearFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Reset Search Filters</span>
          </button>
        )}

        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        )}
      </div>
    </div>
  );
}
