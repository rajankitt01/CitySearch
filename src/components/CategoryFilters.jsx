import React from 'react';
import { 
  Stethoscope, 
  GraduationCap, 
  ShieldAlert, 
  Trees, 
  Building2, 
  Bus, 
  ShoppingBag, 
  Utensils, 
  Landmark, 
  Compass,
  Layers
} from 'lucide-react';
import { PLACE_CATEGORIES } from '../utils/placeCategories.js';

const ICON_MAP = {
  Stethoscope,
  GraduationCap,
  ShieldAlert,
  Trees,
  Building2,
  Bus,
  ShoppingBag,
  Utensils,
  Landmark,
  Compass,
};

export function CategoryFilters({
  activeCategory,
  onSelectCategory,
  categoryCounts = {},
  isOverviewLoading = false
}) {
  return (
    <div className="w-full">
      {/* Category Tabs: Horizontally scrollable on mobile, grid or flex on desktop */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none snap-x -mx-4 px-4 sm:mx-0 sm:px-0">
        {PLACE_CATEGORIES.map((category) => {
          const IconComponent = ICON_MAP[category.icon] || Layers;
          const isActive = activeCategory === category.id;
          const count = categoryCounts[category.id];

          return (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all snap-start shrink-0 border ${
                isActive
                  ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-500/20 scale-[1.02]'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <span
                className={`p-1 rounded-lg ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <IconComponent className="w-4 h-4" />
              </span>

              <span>{category.label}</span>

              {/* Count badge */}
              {count !== undefined ? (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive
                      ? 'bg-white text-brand-700'
                      : count > 0
                      ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      : 'bg-slate-50 text-slate-400 dark:bg-slate-800/40 dark:text-slate-500'
                  }`}
                >
                  {count}
                </span>
              ) : isOverviewLoading ? (
                <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 animate-pulse" />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
