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
import { parseUrlParams } from './utils/share.js';

function AppContent() {
  const urlState = parseUrlParams();

  // Initial city from URL if present
  const initialCity = urlState.hasCity
    ? {
        name: urlState.city,
        lat: urlState.lat,
        lon: urlState.lon,
        displayName: `${urlState.city}`,
        locality: `${urlState.city}`,
      }
    : null;

  const searchState = useCitySearch(initialCity);
  const favoritesState = useFavorites();

  const placesState = usePlaces({
    city: searchState.selectedCity,
    initialCategory: urlState.category || 'healthcare',
    initialRadius: urlState.radius || 5,
  });

  // Modal dialog states
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [reportingPlace, setReportingPlace] = useState(null);

  const { setSelectedPlaceId, places } = placesState;

  // If a placeId was provided in URL query, select it once places are loaded
  useEffect(() => {
    if (urlState.placeId && places.length > 0) {
      setSelectedPlaceId(urlState.placeId);
    }
  }, [urlState.placeId, places, setSelectedPlaceId]);

  const handleGoHome = () => {
    searchState.setSelectedCity(null);
    searchState.setQuery('');
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
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
