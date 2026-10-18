import React from 'react';
import { 
  MapPin, 
  ShieldCheck, 
  Layers, 
  Navigation, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { CitySearch } from '../components/CitySearch.jsx';
import { EmergencyServicesSection } from '../components/EmergencyServicesSection.jsx';
import { PLACE_CATEGORIES } from '../utils/placeCategories.js';

export function Home({
  searchState,
  onSelectCity,
  onSelectCategoryDirectly
}) {
  return (
    <div className="w-full space-y-16 py-8 sm:py-12">
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/50 border border-brand-200/80 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs font-semibold shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-brand-500 animate-pulse" />
          <span>Real-World Open Geographic Discovery</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
          Discover Everything in <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">
            Your City
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Search any city, town, or district to explore hospitals, schools, police stations, transit hubs, parks, government centers, and historical landmarks on an interactive map.
        </p>

        {/* Central Search Component */}
        <div className="pt-2 max-w-2xl mx-auto text-left">
          <CitySearch
            query={searchState.query}
            setQuery={searchState.setQuery}
            suggestions={searchState.suggestions}
            isSearching={searchState.isSearching}
            isLocating={searchState.isLocating}
            searchError={searchState.searchError}
            recentSearches={searchState.recentSearches}
            popularCities={searchState.popularCities}
            onSelectCity={onSelectCity}
            onExecuteSearch={searchState.executeSearch}
            onLocateUser={searchState.locateUser}
            onClearHistory={searchState.clearHistory}
            onClearSuggestions={searchState.clearSuggestions}
          />
        </div>
      </section>

      {/* 10 Essential Categories Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            10 Essential Public Place Categories
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Intelligently mapped using verified OpenStreetMap tags and real geographic coordinates.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {PLACE_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              onClick={() => {
                // If a city is already selected or default to Pune
                const city = searchState.selectedCity || searchState.popularCities.find(c => c.name === 'Pune') || searchState.popularCities[0];
                onSelectCity(city);
                if (onSelectCategoryDirectly) {
                  onSelectCategoryDirectly(cat.id);
                }
              }}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-brand-500/50 dark:hover:border-brand-500/50 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer group"
            >
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors"
                style={{
                  backgroundColor: `${cat.markerColor}15`,
                  color: cat.markerColor
                }}
              >
                <span className="font-bold text-sm">
                  {cat.shortLabel.substring(0, 2)}
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                {cat.label}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                {cat.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Cities Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Explore Popular Indian Metros
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Click any city to immediately launch the interactive discovery dashboard.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {searchState.popularCities.slice(0, 8).map((city) => (
            <div
              key={city.name}
              onClick={() => onSelectCity(city)}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-brand-500 shadow-sm hover:shadow-card transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-mono font-medium text-slate-400">
                  {Number(city.lat || 0).toFixed(2)}°N
                </span>
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                {city.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {city.state}, India
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-brand-600 dark:text-brand-400">
                <span>View All 10 Categories</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Emergency Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <EmergencyServicesSection 
          onSelectCategory={(catId) => {
            const city = searchState.selectedCity || searchState.popularCities.find(c => c.name === 'Pune') || searchState.popularCities[0];
            onSelectCity(city);
            if (onSelectCategoryDirectly) {
              onSelectCategoryDirectly(catId);
            }
          }} 
        />
      </section>

      {/* Core Platform Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-slate-100/70 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/80 dark:text-blue-300 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base text-slate-900 dark:text-white">
              100% Real Geographic Data
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Every hospital, station, and landmark is queried from live OpenStreetMap records. No mock or fabricated places are ever displayed.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-100/70 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-300 flex items-center justify-center mb-4">
              <Navigation className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base text-slate-900 dark:text-white">
              Accurate Distance & Direction
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Calculates great-circle distance from the city center using the Haversine equation and provides instant 1-tap navigation routes.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-100/70 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-950/80 dark:text-purple-300 flex items-center justify-center mb-4">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base text-slate-900 dark:text-white">
              Dynamic Radius & Filtering
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Tailor discovery radius from 2 km to 25 km, filter by subcategories, and search within returned results seamlessly.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
