import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.jsx';
import { Footer } from './components/Footer.jsx';
import { ToastProvider } from './components/Toast.jsx';
import { Home } from './pages/Home.jsx';
import { ExploreCity } from './pages/ExploreCity.jsx';
import { FavoritesModal } from './components/FavoritesModal.jsx';
import { FeedbackModal } from './components/FeedbackModal.jsx';
import { useCitySearch } from './hooks/useCitySearch.js';
import { usePlaces } from './hooks/usePlaces.js';
import { useFavorites } from './hooks/useFavorites.js';
import { parseUrlParams, getShareableUrl } from './utils/share.js';
import { storage } from './utils/storage.js';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';

function AppContent() {
  const urlState = parseUrlParams();
  const savedSession = storage.getActiveSession();

  // Initial city: prioritized from URL params, with fallback to saved active session on refresh
  const initialCity = urlState.hasCity
    ? {
        name: urlState.city,
        lat: urlState.lat,
        lon: urlState.lon,
        displayName: `${urlState.city}`,
        locality: `${urlState.city}`,
      }
    : (savedSession?.city || null);

  const initialCategory = urlState.category || savedSession?.category || 'healthcare';
  const initialRadius = urlState.radius || savedSession?.radius || 5;

  const searchState = useCitySearch(initialCity);
  const favoritesState = useFavorites();

  const placesState = usePlaces({
    city: searchState.selectedCity,
    initialCategory,
    initialRadius,
  });

  // Modal dialog states
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [reportingPlace, setReportingPlace] = useState(null);

  const { setSelectedCity } = searchState;
  const { setSelectedPlaceId, setActiveCategory, setRadiusKm, places } = placesState;

  // Synchronize browser URL & storage session whenever city, category, radius, or place changes
  useEffect(() => {
    if (searchState.selectedCity) {
      const url = getShareableUrl({
        city: searchState.selectedCity.name,
        lat: searchState.selectedCity.lat,
        lon: searchState.selectedCity.lon,
        category: placesState.activeCategory,
        radius: placesState.radiusKm,
        placeId: placesState.selectedPlaceId,
      });

      // Update URL query parameters without full page reload
      window.history.replaceState(null, '', url);

      // Persist active session to storage so refreshing keeps user on exact same view
      storage.setActiveSession({
        city: searchState.selectedCity,
        category: placesState.activeCategory,
        radius: placesState.radiusKm,
        placeId: placesState.selectedPlaceId,
      });
    }
  }, [
    searchState.selectedCity,
    placesState.activeCategory,
    placesState.radiusKm,
    placesState.selectedPlaceId
  ]);

  // Support browser Back and Forward navigation buttons
  useEffect(() => {
    const handlePopState = () => {
      const currentUrl = parseUrlParams();
      if (currentUrl.hasCity) {
        setSelectedCity({
          name: currentUrl.city,
          lat: currentUrl.lat,
          lon: currentUrl.lon,
          displayName: currentUrl.city,
          locality: currentUrl.city,
        });
        if (currentUrl.category) setActiveCategory(currentUrl.category);
        if (currentUrl.radius) setRadiusKm(currentUrl.radius);
        if (currentUrl.placeId) setSelectedPlaceId(currentUrl.placeId);
      } else {
        setSelectedCity(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [setSelectedCity, setActiveCategory, setRadiusKm, setSelectedPlaceId]);

  // If a placeId was provided in URL query, select it once places are loaded
  useEffect(() => {
    if (urlState.placeId && places.length > 0) {
      setSelectedPlaceId(urlState.placeId);
    }
  }, [urlState.placeId, places, setSelectedPlaceId]);

  const handleGoHome = () => {
    searchState.setSelectedCity(null);
    searchState.setQuery('');
    storage.clearActiveSession();
    window.history.pushState({}, '', window.location.pathname);
  };

  const handleOpenEmergency = () => {
    // If on home page, scroll down to emergency section
    const el = document.getElementById('emergency-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      // If on explore page, switch to healthcare/public_safety or trigger emergency
      placesState.setActiveCategory('healthcare');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors font-sans">
      {/* Top Navigation Bar */}
      <Header
        favoritesCount={favoritesState.favoritesCount}
        onOpenFavorites={() => setShowFavoritesModal(true)}
        onOpenEmergency={handleOpenEmergency}
        onOpenFeedback={() => setShowFeedbackModal(true)}
        onGoHome={handleGoHome}
        currentCityName={searchState.selectedCity?.name}
      />

      {/* Main View: Home or Explore */}
      <main className="flex-1 flex flex-col">
        {searchState.selectedCity ? (
          <ExploreCity
            city={searchState.selectedCity}
            placesHook={placesState}
            favoritesHook={favoritesState}
            onBackToHome={handleGoHome}
            reportingPlace={reportingPlace}
            setReportingPlace={setReportingPlace}
          />
        ) : (
          <Home
            searchState={searchState}
            onSelectCity={(city) => searchState.setSelectedCity(city)}
            onSelectCategoryDirectly={(catId) => placesState.setActiveCategory(catId)}
          />
        )}
      </main>

      {/* Global Modals */}
      {showFavoritesModal && (
        <FavoritesModal
          favorites={favoritesState.favorites}
          onClose={() => setShowFavoritesModal(false)}
          onRemoveFavorite={favoritesState.removeFavorite}
          onClearAll={favoritesState.clearAllFavorites}
          onSelectPlace={(place) => {
            placesState.setSelectedPlaceId(place.id);
            placesState.setActiveCategory(place.category);
          }}
        />
      )}

      {showFeedbackModal && (
        <FeedbackModal onClose={() => setShowFeedbackModal(false)} />
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </ErrorBoundary>
  );
}
