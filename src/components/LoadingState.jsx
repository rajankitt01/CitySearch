import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingState({ message = 'Discovering verified places...' }) {
  return (
    <div className="w-full space-y-4">
      {/* Friendly loading status banner */}
      <div className="flex items-center justify-center gap-2.5 p-4 rounded-2xl bg-brand-50/60 dark:bg-brand-950/30 border border-brand-100 dark:border-brand-900/40 text-brand-700 dark:text-brand-300 text-xs font-semibold">
        <Loader2 className="w-4 h-4 animate-spin text-brand-600 dark:text-brand-400" />
        <span>{message}</span>
      </div>

      {/* Grid of Skeleton Place Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 animate-pulse space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded-full" />
              <div className="h-4 w-12 bg-slate-100 dark:bg-slate-800 rounded-full" />
            </div>
            <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            <div className="space-y-1.5">
              <div className="h-3.5 w-full bg-slate-100 dark:bg-slate-800 rounded" />
              <div className="h-3.5 w-2/3 bg-slate-100 dark:bg-slate-800 rounded" />
            </div>
            <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-4 w-16 bg-slate-100 dark:bg-slate-800 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
