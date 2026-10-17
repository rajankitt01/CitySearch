import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  Layers, 
  Eye, 
  EyeOff, 
  MapPin 
} from 'lucide-react';
import { MapMarker } from './MapMarker.jsx';
import { PLACE_CATEGORIES } from '../utils/placeCategories.js';

// Controller to smoothly update map view when city or selected place changes
function MapViewController({ center, zoom, selectedCoords }) {
  const map = useMap();

  useEffect(() => {
    if (selectedCoords && selectedCoords.lat && selectedCoords.lon) {
      map.flyTo([selectedCoords.lat, selectedCoords.lon], 16, {
        duration: 1.2,
      });
    } else if (center && center.lat && center.lon) {
      map.flyTo([center.lat, center.lon], zoom, {
        duration: 1,
      });
    }
  }, [map, center, zoom, selectedCoords]);

  return null;
}

// Custom icon for the City Center marker
function createCityCenterIcon(cityName) {
  const html = `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
      <div style="
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background-color: #2563eb;
        border: 3px solid #ffffff;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.4), 0 4px 10px rgba(0,0,0,0.3);
      "></div>
      <div style="
        margin-top: 4px;
        background: #1e293b;
        color: #ffffff;
        font-size: 10px;
        font-weight: 700;
        padding: 2px 6px;
        border-radius: 4px;
        white-space: nowrap;
        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        pointer-events: none;
      ">
        Center: ${cityName || 'City'}
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'city-center-marker',
    iconSize: [24, 40],
    iconAnchor: [12, 9],
  });
}

export function CityMap({
  city,
  places = [],
  radiusKm = 5,
  activeCategory,
  selectedPlaceId,
  onSelectPlace,
  onViewDetails,
  isFavoritePlace,
  onToggleFavorite
}) {
  const [showLegend, setShowLegend] = useState(false);
  const [showRadiusCircle, setShowRadiusCircle] = useState(true);

  // Zoom calculation based on radius
  const zoomLevel = useMemo(() => {
    if (radiusKm <= 2) return 14;
    if (radiusKm <= 5) return 13;
    if (radiusKm <= 10) return 12;
    return 11;
  }, [radiusKm]);

  // Selected place coordinates for flying to
  const selectedCoords = useMemo(() => {
    if (!selectedPlaceId) return null;
    const found = places.find(p => p.id === selectedPlaceId);
    return found ? { lat: found.lat, lon: found.lon } : null;
  }, [places, selectedPlaceId]);

  if (!city || !city.lat || !city.lon) {
    return (
      <div className="w-full h-full min-h-[380px] rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center p-6 text-center">
        <MapPin className="w-10 h-10 text-slate-400 mb-2 animate-bounce" />
        <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No City Selected</h3>
        <p className="text-xs text-slate-500 max-w-xs mt-1">
          Select or search for a city to initialize the live interactive map.
        </p>
      </div>
    );
  }

  const centerIcon = createCityCenterIcon(city.name);

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-slate-100 dark:bg-slate-900">
      {/* Map Controls Floating Overlay */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
        {/* Toggle Radius Circle */}
        <button
          onClick={() => setShowRadiusCircle(!showRadiusCircle)}
          className="p-2.5 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-md text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 border border-slate-200 dark:border-slate-800 transition-all text-xs font-semibold flex items-center gap-1.5"
          title={showRadiusCircle ? 'Hide radius circle' : 'Show radius circle'}
        >
          {showRadiusCircle ? <EyeOff className="w-4 h-4 text-brand-600" /> : <Eye className="w-4 h-4" />}
          <span className="hidden sm:inline">{radiusKm} km radius</span>
        </button>

        {/* Legend Toggle */}
        <button
          onClick={() => setShowLegend(!showLegend)}
          className={`p-2.5 rounded-xl backdrop-blur-md shadow-md border transition-all text-xs font-semibold flex items-center gap-1.5 ${
            showLegend
              ? 'bg-brand-600 text-white border-brand-600'
              : 'bg-white/95 dark:bg-slate-900/95 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:text-brand-600'
          }`}
          title="Marker Category Legend"
        >
          <Layers className="w-4 h-4" />
          <span className="hidden sm:inline">Legend</span>
        </button>
      </div>

      {/* Floating Category Legend */}
      {showLegend && (
        <div className="absolute bottom-6 right-3 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 max-w-[220px] animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Marker Legend
            </span>
            <button
              onClick={() => setShowLegend(false)}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              ✕
            </button>
          </div>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {PLACE_CATEGORIES.map((cat) => (
              <div key={cat.id} className="flex items-center gap-2 text-xs">
                <span
                  className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: cat.markerColor }}
                />
                <span className={`truncate ${activeCategory === cat.id ? 'font-bold text-brand-600 dark:text-brand-400' : 'text-slate-700 dark:text-slate-300'}`}>
                  {cat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results Marker Counter Pill */}
      <div className="absolute bottom-3 left-3 z-20 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-md border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>{places.length} places mapped</span>
      </div>

      {/* Interactive Leaflet Map */}
      <MapContainer
        center={[city.lat, city.lon]}
        zoom={zoomLevel}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <MapViewController
          center={{ lat: city.lat, lon: city.lon }}
          zoom={zoomLevel}
          selectedCoords={selectedCoords}
        />

        {/* Real OpenStreetMap Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Search Radius Circle */}
        {showRadiusCircle && (
          <Circle
            center={[city.lat, city.lon]}
            radius={radiusKm * 1000}
            pathOptions={{
              color: '#3b82f6',
              fillColor: '#3b82f6',
              fillOpacity: 0.08,
              weight: 1.5,
              dashArray: '5, 5'
            }}
          />
        )}

        {/* City Center Pin */}
        <Marker
          position={[city.lat, city.lon]}
          icon={centerIcon}
        >
          <Popup>
            <div className="p-2 text-xs text-slate-800 dark:text-slate-100 font-semibold">
              <div className="text-brand-600 font-bold mb-0.5">City Reference Center</div>
              <div>{city.displayName || city.name}</div>
              <div className="text-[10px] text-slate-400 mt-1 font-mono">
                {city.lat.toFixed(4)}, {city.lon.toFixed(4)}
              </div>
            </div>
          </Popup>
        </Marker>

        {/* Place Markers */}
        {places.map((place) => (
          <MapMarker
            key={place.id}
            place={place}
            isSelected={selectedPlaceId === place.id}
            onSelect={onSelectPlace}
            onViewDetails={onViewDetails}
            isFavorite={isFavoritePlace(place.id)}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </MapContainer>
    </div>
  );
}
