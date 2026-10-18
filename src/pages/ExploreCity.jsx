import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Share2, 
  RotateCcw, 
  Compass, 
  Search, 
  Map as MapIcon, 
  List, 
  Check 
} from 'lucide-react';
import { CategoryFilters } from '../components/CategoryFilters.jsx';
import { PlaceCard } from '../components/PlaceCard.jsx';
import { CityMap } from '../components/CityMap.jsx';
import { LoadingState } from '../components/LoadingState.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import { PlaceDetailsModal } from '../components/PlaceDetailsModal.jsx';
import { ReportPlaceModal } from '../components/ReportPlaceModal.jsx';
import { getCategoryById } from '../utils/placeCategories.js';
import { copyToClipboard, getShareableUrl } from '../utils/share.js';
import { useToast } from '../hooks/useToast.js';
import { ErrorBoundary } from '../components/ErrorBoundary.jsx';

export function ExploreCity({
  city,
  placesHook,
  favoritesHook,
  onBackToHome,
  reportingPlace,
  setReportingPlace
}) {
  const [mobileTab, setMobileTab] = useState('list'); // 'list' | 'map'
  const [activeModalPlace, setActiveModalPlace] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const { addToast } = useToast();

  const {
    activeCategory,
    setActiveCategory,
    radiusKm,
    setRadiusKm,
    places,
    filteredPlaces,
    visiblePlaces,
    hasMore,
    loadMore,
    isLoading,
    error,
    retry,
    searchQuery,
    setSearchQuery,
    selectedSubCategory,
    setSelectedSubCategory,
    availableSubCategories,
    sortBy,
    setSortBy,
    onlyOpenNow,
    setOnlyOpenNow,
    clearAllFilters,
    selectedPlaceId,
    setSelectedPlaceId,
    categoryCounts,
    isOverviewLoading
  } = placesHook;

  const currentCategoryObj = getCategoryById(activeCategory);

  const handleShareCity = async () => {
    const url = getShareableUrl({
      city: city.name,
      lat: city.lat,
      lon: city.lon,
      category: activeCategory,
      radius: radiusKm
    });

    const success = await copyToClipboard(url);
    if (success) {
      setCopiedLink(true);
      addToast(`Share link copied to clipboard!`, 'success');
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handlePlaceSelect = (placeId) => {
    setSelectedPlaceId(placeId);
  };

  const handleViewDetails = (place) => {
    setActiveModalPlace(place);
  };

  const handleExpandRadius = () => {
    if (radiusKm < 10) setRadiusKm(10);
    else if (radiusKm < 25) setRadiusKm(25);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Breadcrumb & City Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
            title="Back to City Search"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {city.name}
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                {Number(city.lat || 0).toFixed(3)}°N, {Number(city.lon || 0).toFixed(3)}°E
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-lg">
              {city.locality || city.displayName}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleShareCity}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
            title="Share this city view"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>Share View</span>
          </button>

          <button
            onClick={onBackToHome}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20 transition-all"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Change City</span>
          </button>
        </div>
      </div>

      {/* Category Tabs Bar */}
      <div className="space-y-2">
        <CategoryFilters
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          categoryCounts={categoryCounts}
          isOverviewLoading={isOverviewLoading}
        />
      </div>

      {/* Filter and Control Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* In-results Search */}
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search in ${currentCategoryObj?.label || 'places'}...`}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Subcategory Dropdown */}
          <div>
            <select
              value={selectedSubCategory}
              onChange={(e) => setSelectedSubCategory(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="all">All Subcategories ({places.length})</option>
              {availableSubCategories.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>

          {/* Radius Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
              Radius:
            </span>
            <div className="grid grid-cols-5 gap-1 w-full">
              {[2, 5, 10, 15, 25].map((r) => (
                <button
                  key={r}
                  onClick={() => setRadiusKm(r)}
                  className={`py-1 text-center rounded-lg text-xs font-semibold transition-all ${
                    radiusKm === r
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {r}k
                </button>
              ))}
            </div>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="distance">Nearest Distance First</option>
              <option value="name">Alphabetical (A - Z)</option>
            </select>
          </div>
        </div>

        {/* Bottom bar of toolbar: Active metrics, Open now toggle & Clear filters */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-600 dark:text-slate-400 font-medium">
              Showing <strong>{filteredPlaces.length}</strong> of {places.length} {currentCategoryObj?.label} places in {city.name}
            </span>

            {/* Open now filter */}
            <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300 select-none">
              <input
                type="checkbox"
                checked={onlyOpenNow}
                onChange={(e) => setOnlyOpenNow(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-brand-600 focus:ring-brand-500"
              />
              <span className="text-xs">Open Now (when available)</span>
            </label>
          </div>

          {(searchQuery || selectedSubCategory !== 'all' || onlyOpenNow || sortBy !== 'distance') && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Tab Switcher (List vs Map) */}
      <div className="lg:hidden flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setMobileTab('list')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            mobileTab === 'list'
              ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <List className="w-4 h-4" />
          <span>List View ({filteredPlaces.length})</span>
        </button>

        <button
          onClick={() => setMobileTab('map')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            mobileTab === 'map'
              ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <MapIcon className="w-4 h-4" />
          <span>Interactive Map</span>
        </button>
      </div>

      {/* Main Content Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Place Cards List */}
        <div className={`lg:col-span-7 space-y-4 ${mobileTab === 'map' ? 'hidden lg:block' : 'block'}`}>
          {isLoading ? (
            <LoadingState 
              message={`Querying OpenStreetMap for real ${currentCategoryObj?.label.toLowerCase() || 'places'} in ${city.name} (${radiusKm} km radius)...`} 
            />
          ) : error ? (
            <div className="p-8 rounded-3xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-center space-y-3">
              <h3 className="font-bold text-rose-700 dark:text-rose-300 text-base">
                Unable to load {currentCategoryObj?.label}
              </h3>
              <p className="text-xs text-rose-600 dark:text-rose-400 max-w-sm mx-auto">
                {error}
              </p>
              <button
                onClick={retry}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
              >
                Retry Query
              </button>
            </div>
          ) : filteredPlaces.length === 0 ? (
            <EmptyState
              title={`No ${currentCategoryObj?.label || 'places'} found`}
              description={`No mapped places found within ${radiusKm} km of ${city.name} center for this category.`}
              onClearFilters={searchQuery || selectedSubCategory !== 'all' ? clearAllFilters : null}
              onIncreaseRadius={radiusKm < 25 ? handleExpandRadius : null}
              currentRadius={radiusKm}
            />
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {visiblePlaces.map((place) => (
                  <PlaceCard
                    key={place.id}
                    place={place}
                    isSelected={selectedPlaceId === place.id}
                    onSelect={handlePlaceSelect}
                    onViewDetails={handleViewDetails}
                    isFavorite={favoritesHook.isFavorite(place.id)}
                    onToggleFavorite={favoritesHook.toggleFavorite}
                  />
                ))}
              </div>

              {/* Load More Pagination Button */}
              {hasMore && (
                <div className="pt-4 text-center">
                  <button
                    onClick={loadMore}
                    className="px-6 py-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold shadow-sm hover:shadow transition-all"
                  >
                    Load More Places ({filteredPlaces.length - visiblePlaces.length} remaining)
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Sticky Leaflet Map */}
        <div className={`lg:col-span-5 lg:sticky lg:top-24 h-[500px] lg:h-[calc(100vh-140px)] ${mobileTab === 'list' ? 'hidden lg:block' : 'block'}`}>
          <ErrorBoundary fallback={
            <div className="w-full h-full min-h-[400px] rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-6 text-center">
              <Compass className="w-8 h-8 text-slate-400 mb-2" />
              <p className="text-xs text-slate-500 font-medium">Interactive Map could not load on this device view.</p>
            </div>
          }>
            <CityMap
              city={city}
              places={filteredPlaces}
              radiusKm={radiusKm}
              activeCategory={activeCategory}
              selectedPlaceId={selectedPlaceId}
              onSelectPlace={handlePlaceSelect}
              onViewDetails={handleViewDetails}
              isFavoritePlace={favoritesHook.isFavorite}
              onToggleFavorite={favoritesHook.toggleFavorite}
              isMobileHidden={mobileTab === 'list'}
            />
          </ErrorBoundary>
        </div>
      </div>

      {/* Place Details Modal */}
      {activeModalPlace && (
        <PlaceDetailsModal
          place={activeModalPlace}
          cityName={city.name}
          onClose={() => setActiveModalPlace(null)}
          isFavorite={favoritesHook.isFavorite(activeModalPlace.id)}
          onToggleFavorite={favoritesHook.toggleFavorite}
          onReportPlace={(place) => setReportingPlace(place)}
        />
      )}

      {/* Report Place Modal */}
      {reportingPlace && (
        <ReportPlaceModal
          place={reportingPlace}
          onClose={() => setReportingPlace(null)}
        />
      )}
    </div>
  );
}
