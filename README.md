# CitySearch — Complete City Discovery Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646cff.svg)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38b2ac.svg)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900.svg)](https://leafletjs.com/)
[![Data Source](https://img.shields.io/badge/Data-OpenStreetMap-7ebc6f.svg)](https://www.openstreetmap.org/)

**CitySearch** is a responsive, production-oriented city discovery web application. It enables users to search for any city, town, or locality worldwide (with specialized curated quick-links for Indian metros) and explore essential public places across 10 vital categories on an interactive Leaflet map and synchronized card feed.

Every single point of interest displayed originates from real-world open geographic data (OpenStreetMap & Nominatim). **No fake, mock, or fabricated locations are ever shown.**

---

## Table of Contents

- [Key Features](#key-features)
- [10 Essential Place Categories](#10-essential-place-categories)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Data Providers & Failover Strategy](#data-providers--failover-strategy)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Development Server](#development-server)
  - [Production Build & Linting](#production-build--linting)
- [Environment Configuration](#environment-configuration)
- [Data Attribution & Fair Use Limits](#data-attribution--fair-use-limits)
- [Vercel Deployment](#vercel-deployment)
- [Verified Cities Testing](#verified-cities-testing)
- [Contributing & Error Reporting](#contributing--error-reporting)

---

## Key Features

- **Real Open Geographic Data**: Direct real-time integration with OpenStreetMap (via Nominatim Geocoding and multi-mirror Overpass API engines) with automatic graceful fallback.
- **Interactive Leaflet Map**:
  - Custom category-themed Retina SVG map pins with animated active ring pulses.
  - Smooth animated camera fly-to transitions when switching cities or selecting places.
  - Interactive radius overlay circle (2 km to 25 km).
  - Floating expandable category marker legend.
  - Instant 1-tap route directions linking directly to Google Maps / OpenStreetMap.
- **Synchronized Dual-View (List & Map)**:
  - Clicking any card on the list immediately highlights and centers its marker on the map.
  - Clicking any map marker activates and expands the corresponding place card and modal.
  - Mobile-optimized switch between List and Map viewports.
- **10 Core Public Service Categories**:
  - Healthcare, Education, Public Safety, Parks & Recreation, Government Offices, Transportation Hubs, Shopping & Daily Needs, Food & Accommodation, Banking & Utilities, and Tourism & Culture.
- **Advanced Filtering & In-Results Search**:
  - Real-time search by place name, address, or tag within retrieved category results.
  - Subcategory chip filtering (e.g., Hospital vs. Pharmacy vs. Clinic).
  - Distance-based sorting using the Haversine equation from the city center.
  - Real opening-hours filter (only displayed when verified hours are available).
  - 1-click filter reset with active result count indicators.
- **Saved Places (Favorites)**:
  - Bookmark favorite public places locally in browser `localStorage`.
  - Dedicated Saved Places modal with instant navigation, item removal, and 1-tap clearing.
- **Deep Shareable Links**:
  - Generate copyable URL parameters containing selected city name, coordinates, category filter, radius, and targeted place ID (`?city=Pune&lat=18.52&lon=73.85&cat=healthcare&placeId=...`).
- **Emergency Services Hub**:
  - Dedicated 24/7 national emergency dialer section for India (112 National Emergency, 100 Police, 101 Fire, 102 Ambulance, 1091 Women's Helpline, 1098 Childline).
  - Disclaimed transparently as informational public service links.
- **Place Verification & Reporting**:
  - Integrated "Report Incorrect Details" modal enabling users to flag inaccuracies (wrong location, permanent closure, typo) to help maintain data integrity.
- **Modern Responsive UI / Dark Mode**:
  - Tailored blue/slate color palette with accessible contrast.
  - System-preference aware Dark and Light theme toggle.

---

## 10 Essential Place Categories

| Category | OpenStreetMap Tags Queried | Example POIs |
| :--- | :--- | :--- |
| **Healthcare** | `amenity=hospital`, `amenity=clinic`, `amenity=pharmacy`, `amenity=doctors` | Hospitals, 24/7 Pharmacies, Clinics |
| **Education** | `amenity=school`, `amenity=college`, `amenity=university`, `amenity=library` | Universities, High Schools, Public Libraries |
| **Public Safety** | `amenity=police`, `amenity=fire_station`, `emergency=fire_hydrant` | Police Stations, Fire Stations, Outposts |
| **Parks & Recreation** | `leisure=park`, `leisure=garden`, `leisure=playground`, `leisure=sports_centre`, `tourism=museum` | Public Gardens, Stadiums, Playgrounds, Zoos |
| **Government** | `amenity=townhall`, `office=government`, `amenity=courthouse`, `amenity=post_office` | Municipal Corporations, District Courts, Post Offices |
| **Transportation** | `railway=station`, `amenity=bus_station`, `aeroway=aerodrome`, `amenity=fuel`, `amenity=charging_station` | Metro Stations, Rail Junctions, Bus Terminals, EV Charging |
| **Shopping** | `shop=supermarket`, `shop=mall`, `shop=department_store`, `amenity=marketplace` | Malls, Supermarkets, Daily Farmers Markets |
| **Food & Stay** | `amenity=restaurant`, `amenity=cafe`, `tourism=hotel`, `tourism=guest_house` | Cafes, Restaurants, Hotels, Hostels |
| **Banking & Utilities** | `amenity=bank`, `amenity=atm`, `amenity=toilets`, `amenity=drinking_water` | Nationalized Banks, 24/7 ATMs, Public Restrooms |
| **Tourism & Culture** | `historic=monument`, `tourism=attraction`, `amenity=place_of_worship`, `historic=memorial` | Heritage Forts, Temples, Cultural Centers, Museums |

---

## Architecture & Tech Stack

```
CitySearch/
├── public/                 # Static assets and icons
├── src/
│   ├── assets/             # Branding graphics & vector assets
│   ├── components/         # Reusable presentation and UI modules
│   │   ├── CategoryFilters.jsx          # Category navigation bar & counts
│   │   ├── CityMap.jsx                  # Leaflet interactive map container
│   │   ├── CitySearch.jsx               # Autocomplete search & popular cities
│   │   ├── EmergencyServicesSection.jsx # 24/7 Helpline section
│   │   ├── EmptyState.jsx               # No results illustration & retry actions
│   │   ├── FavoritesModal.jsx           # Saved places bookmark manager
│   │   ├── FeedbackModal.jsx            # User experience review dialog
│   │   ├── Footer.jsx                   # ODbL attribution & compliance links
│   │   ├── Header.jsx                   # Brand logo, dark mode, nav controls
│   │   ├── LoadingState.jsx             # Accessible skeleton loaders
│   │   ├── MapMarker.jsx                # Custom category DivIcon & popup
│   │   ├── PlaceCard.jsx                # Responsive POI summary card
│   │   ├── PlaceDetailsModal.jsx        # Complete place metadata & raw tags
│   │   ├── ReportPlaceModal.jsx         # Data discrepancy reporting form
│   │   └── Toast.jsx                    # Action toast notification provider
│   ├── context/
│   │   └── ToastContext.js              # Dedicated notification context
│   ├── hooks/
│   │   ├── useCitySearch.js             # Debounced geocoding search & recent searches
│   │   ├── useFavorites.js              # LocalStorage bookmarking hook
│   │   ├── usePlaces.js                 # POI queries, filtering, sorting, pagination
│   │   └── useToast.js                  # Global toast dispatcher hook
│   ├── pages/
│   │   ├── Home.jsx                     # Hero showcase, popular cities, emergency hub
│   │   └── ExploreCity.jsx              # City exploration dashboard (Dual Map/List)
│   ├── services/
│   │   ├── geocodingService.js          # Nominatim / Geoapify location resolver
│   │   └── placesService.js             # Overpass multi-mirror & Nominatim failover
│   ├── utils/
│   │   ├── distance.js                  # Haversine distance calculator
│   │   ├── placeCategories.js           # 10 categories mapping & color rules
│   │   ├── share.js                     # URL query parameters & clipboard sharing
│   │   └── storage.js                   # Safe local storage wrapper with TTL cache
│   ├── App.jsx                          # Main application controller & URL routing
│   ├── index.css                        # Tailwind CSS imports & animations
│   └── main.jsx                         # React 19 root bootstrap
├── .env.example            # Environment template
├── vercel.json             # Vercel SPA routing & asset caching rules
├── vite.config.js          # Vite 8 config with optimized chunk splitting
└── package.json            # Scripts & dependencies
```

---

## Data Providers & Failover Strategy

CitySearch is engineered with resilient high availability:

```
[User Selects City & Category]
                 │
                 ▼
      [Overpass Mirror Cluster]
       ├─ Primary: z.overpass-api.de
       ├─ Secondary: lz4.overpass-api.de
       ├─ Tertiary: overpass-api.de
       └─ Quaternary: overpass.kumi.systems
                 │
     (If all mirrors busy/rate-limited)
                 ▼
      [Nominatim Category Fallback]
  (Returns verified open POIs matching category)
                 │
                 ▼
      [Local 15-Minute Cache Layer]
 (Caches responses in localStorage to prevent repeated calls)
```

- **Client-Side Cache**: Successful queries are cached in `localStorage` with a 15-minute TTL, avoiding repeated network requests when switching between categories.
- **Request Throttling**: Geocoding inputs are debounced by 350ms to conform with OpenStreetMap Nominatim usage policies.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18.0.0 or higher
- `npm` v9.0.0 or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/city-search.git

# Navigate into project directory
cd city-search

# Install dependencies
npm install
```

### Development Server

Run the local development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

Open your browser at `http://localhost:5173`.

### Production Build & Linting

```bash
# Verify code quality with Oxlint (0 warnings / 0 errors)
npm run lint

# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## Environment Configuration

CitySearch runs **100% out-of-the-box** without any required API keys using public OpenStreetMap endpoints. 

To configure optional custom mirrors or add Geoapify:

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Edit the `.env` file:
   ```env
   # Preferred geocoding provider: 'nominatim' (default) or 'geoapify'
   VITE_GEOCODING_PROVIDER=nominatim

   # Optional: Geoapify API Key (from https://www.geoapify.com)
   VITE_GEOAPIFY_API_KEY=

   # Optional: Custom Overpass API interpreter mirror
   VITE_OVERPASS_API_URL=https://z.overpass-api.de/api/interpreter

   # Optional: Supabase configuration (for cloud-saved places)
   VITE_SUPABASE_URL=
   VITE_SUPABASE_ANON_KEY=
   ```

---

## Data Attribution & Fair Use Limits

1. **OpenStreetMap Data**:
   - Map tiles and POI data are &copy; [OpenStreetMap contributors](https://www.openstreetmap.org/copyright), licensed under the [Open Database License (ODbL) 1.0](https://opendatacommons.org/licenses/odbl/).
   - An attribution badge and clickable links are integrated into the map corner and site footer.
2. **Nominatim Usage Policy**:
   - Maximum 1 request per second.
   - Identified with custom application `User-Agent`.
   - Results cached locally to prevent server strain.
3. **Overpass API Fair Use**:
   - Automated timeout ceilings of 12-25 seconds per query.
   - Bounded queries (`around:radius,lat,lon`) limited to reasonable discovery radiuses (2 km – 25 km).
4. **Emergency Services Attribution**:
   - Emergency contacts reflect official Indian National ERSS numbers (Emergency Response Support System under the Ministry of Home Affairs).

---

## Vercel Deployment

This project includes a production-ready `vercel.json` configured for Single Page Applications:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

To deploy via Vercel CLI:
```bash
npx vercel
```
Or import the repository directly in the [Vercel Dashboard](https://vercel.com).

---

## Verified Cities Testing

The following cities were actively tested with real queries during verification:

1. **Pune, Maharashtra**: 
   - Geocoding coordinates: `18.5214° N, 73.8545° E`
   - Real categories verified: Healthcare (Metropolis Healthcare, Ruby Hall, Jehangir Hospital), Education (Pune University, Fergusson College), Public Safety, Transit.
2. **Jaipur, Rajasthan**:
   - Geocoding coordinates: `26.9155° N, 75.8190° E`
   - Real categories verified: Tourism & Heritage (Hawa Mahal, City Palace, Albert Hall), Hotels, Markets.
3. **Kochi, Kerala**:
   - Geocoding coordinates: `9.9679° N, 76.2444° E`
   - Real categories verified: Transportation (Ernakulam Junction, Kochi Metro Stations, Boat Jetties), Healthcare, Banking.
4. **Invalid Search Edge Cases**:
   - Search: `"NonExistentCity999XYZ"` &rarr; Handled cleanly with empty state, helpful suggestions, and zero unhandled exceptions.

---

## License

This project is licensed under the [MIT License](LICENSE). Mapped geographic data is provided by OpenStreetMap contributors under the ODbL.
