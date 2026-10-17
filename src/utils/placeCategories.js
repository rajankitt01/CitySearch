/**
 * Category definitions for CitySearch
 * Maps each category to appropriate OpenStreetMap tags, colors, and UI metadata.
 */

export const PLACE_CATEGORIES = [
  {
    id: 'healthcare',
    label: 'Healthcare',
    shortLabel: 'Health',
    description: 'Hospitals, clinics, pharmacies, labs, blood banks & veterinary services',
    icon: 'Stethoscope',
    color: 'rose',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
    markerColor: '#e11d48', // rose-600
    isEmergency: true,
    osmTags: [
      '["amenity"="hospital"]',
      '["amenity"="clinic"]',
      '["amenity"="pharmacy"]',
      '["amenity"="doctors"]',
      '["amenity"="veterinary"]',
      '["healthcare"="laboratory"]',
      '["healthcare"="blood_bank"]',
      '["healthcare"="hospital"]',
      '["healthcare"="clinic"]',
    ],
    subCategories: [
      'Hospital',
      'Clinic',
      'Pharmacy',
      'Diagnostic Lab',
      'Blood Bank',
      'Veterinary'
    ]
  },
  {
    id: 'education',
    label: 'Education',
    shortLabel: 'Education',
    description: 'Schools, colleges, universities, libraries & training institutes',
    icon: 'GraduationCap',
    color: 'blue',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    markerColor: '#2563eb', // blue-600
    isEmergency: false,
    osmTags: [
      '["amenity"="school"]',
      '["amenity"="college"]',
      '["amenity"="university"]',
      '["amenity"="library"]',
      '["amenity"="kindergarten"]',
    ],
    subCategories: [
      'School',
      'College',
      'University',
      'Library',
      'Coaching Center'
    ]
  },
  {
    id: 'public_safety',
    label: 'Public Safety',
    shortLabel: 'Safety',
    description: 'Police stations, fire stations and emergency response posts',
    icon: 'ShieldAlert',
    color: 'amber',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    markerColor: '#d97706', // amber-600
    isEmergency: true,
    osmTags: [
      '["amenity"="police"]',
      '["amenity"="fire_station"]',
      '["emergency"="disaster_help_point"]',
    ],
    subCategories: [
      'Police Station',
      'Fire Station',
      'Emergency Post'
    ]
  },
  {
    id: 'parks_recreation',
    label: 'Parks & Recreation',
    shortLabel: 'Parks',
    description: 'Parks, botanical gardens, zoos, playgrounds, stadiums & sports grounds',
    icon: 'Trees',
    color: 'emerald',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    markerColor: '#059669', // emerald-600
    isEmergency: false,
    osmTags: [
      '["leisure"="park"]',
      '["leisure"="garden"]',
      '["leisure"="playground"]',
      '["leisure"="pitch"]',
      '["leisure"="sports_centre"]',
      '["leisure"="stadium"]',
      '["tourism"="zoo"]',
      '["tourism"="theme_park"]',
    ],
    subCategories: [
      'Public Park',
      'Garden',
      'Playground',
      'Stadium',
      'Sports Complex',
      'Zoo'
    ]
  },
  {
    id: 'government',
    label: 'Government & Public Services',
    shortLabel: 'Govt',
    description: 'Municipal corporations, courts, post offices & civic centers',
    icon: 'Building2',
    color: 'indigo',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800',
    markerColor: '#4f46e5', // indigo-600
    isEmergency: false,
    osmTags: [
      '["amenity"="townhall"]',
      '["amenity"="courthouse"]',
      '["amenity"="post_office"]',
      '["amenity"="community_centre"]',
      '["amenity"="public_building"]',
      '["office"="government"]',
      '["office"="administrative"]',
    ],
    subCategories: [
      'Government Office',
      'Municipal Office',
      'Court',
      'Post Office',
      'Civic Center'
    ]
  },
  {
    id: 'transportation',
    label: 'Transportation',
    shortLabel: 'Transit',
    description: 'Railway stations, metro stations, bus terminals, airports, EV charging & fuel',
    icon: 'Bus',
    color: 'cyan',
    badgeClass: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800',
    markerColor: '#0891b2', // cyan-600
    isEmergency: false,
    osmTags: [
      '["railway"="station"]',
      '["railway"="subway_entrance"]',
      '["amenity"="bus_station"]',
      '["amenity"="fuel"]',
      '["amenity"="charging_station"]',
      '["amenity"="parking"]',
      '["aeroway"="aerodrome"]',
    ],
    subCategories: [
      'Railway Station',
      'Metro Station',
      'Bus Station',
      'Airport',
      'Fuel Station',
      'EV Charging',
      'Parking'
    ]
  },
  {
    id: 'shopping',
    label: 'Shopping & Daily Needs',
    shortLabel: 'Shopping',
    description: 'Malls, supermarkets, department stores, markets & local groceries',
    icon: 'ShoppingBag',
    color: 'violet',
    badgeClass: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800',
    markerColor: '#7c3aed', // violet-600
    isEmergency: false,
    osmTags: [
      '["shop"="mall"]',
      '["shop"="supermarket"]',
      '["shop"="department_store"]',
      '["shop"="convenience"]',
      '["shop"="general"]',
      '["amenity"="marketplace"]',
    ],
    subCategories: [
      'Shopping Mall',
      'Supermarket',
      'Marketplace',
      'Department Store',
      'Convenience Store'
    ]
  },
  {
    id: 'food_accommodation',
    label: 'Food & Accommodation',
    shortLabel: 'Food & Stay',
    description: 'Restaurants, cafes, bakeries, hotels, hostels & guest houses',
    icon: 'Utensils',
    color: 'orange',
    badgeClass: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800',
    markerColor: '#ea580c', // orange-600
    isEmergency: false,
    osmTags: [
      '["amenity"="restaurant"]',
      '["amenity"="cafe"]',
      '["amenity"="fast_food"]',
      '["amenity"="food_court"]',
      '["tourism"="hotel"]',
      '["tourism"="hostel"]',
      '["tourism"="guest_house"]',
    ],
    subCategories: [
      'Restaurant',
      'Cafe',
      'Hotel',
      'Hostel',
      'Guest House'
    ]
  },
  {
    id: 'banking_utilities',
    label: 'Banking & Utilities',
    shortLabel: 'Banking',
    description: 'Banks, 24/7 ATMs, public rest facilities & drinking water stations',
    icon: 'Landmark',
    color: 'teal',
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800',
    markerColor: '#0d9488', // teal-600
    isEmergency: false,
    osmTags: [
      '["amenity"="bank"]',
      '["amenity"="atm"]',
      '["amenity"="toilets"]',
      '["amenity"="drinking_water"]',
    ],
    subCategories: [
      'Bank',
      'ATM',
      'Public Toilet',
      'Drinking Water'
    ]
  },
  {
    id: 'tourism_culture',
    label: 'Tourism & Culture',
    shortLabel: 'Tourism',
    description: 'Historical monuments, heritage sites, places of worship & museums',
    icon: 'Compass',
    color: 'fuchsia',
    badgeClass: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200 dark:bg-fuchsia-950/40 dark:text-fuchsia-300 dark:border-fuchsia-800',
    markerColor: '#c026d3', // fuchsia-600
    isEmergency: false,
    osmTags: [
      '["tourism"="attraction"]',
      '["tourism"="museum"]',
      '["tourism"="viewpoint"]',
      '["historic"="monument"]',
      '["historic"="memorial"]',
      '["historic"="fort"]',
      '["historic"="castle"]',
      '["amenity"="place_of_worship"]',
    ],
    subCategories: [
      'Monument',
      'Attraction',
      'Museum',
      'Heritage Site',
      'Place of Worship'
    ]
  }
];

export const CATEGORY_MAP = PLACE_CATEGORIES.reduce((acc, cat) => {
  acc[cat.id] = cat;
  return acc;
}, {});

export function getCategoryById(categoryId) {
  return CATEGORY_MAP[categoryId] || null;
}

/**
 * Returns human-readable subcategory or tag classification from raw OSM tags
 */
export function deriveSubCategory(tags, categoryId) {
  if (!tags) return 'Public Place';

  // Specific mappings
  if (tags.amenity === 'hospital') return 'Hospital';
  if (tags.amenity === 'clinic') return 'Clinic';
  if (tags.amenity === 'pharmacy') return 'Pharmacy';
  if (tags.amenity === 'doctors') return 'Medical Doctor';
  if (tags.amenity === 'police') return 'Police Station';
  if (tags.amenity === 'fire_station') return 'Fire Station';
  if (tags.amenity === 'school') return 'School';
  if (tags.amenity === 'college') return 'College';
  if (tags.amenity === 'university') return 'University';
  if (tags.amenity === 'library') return 'Library';
  if (tags.amenity === 'bank') return 'Bank';
  if (tags.amenity === 'atm') return 'ATM';
  if (tags.amenity === 'toilets') return 'Public Restroom';
  if (tags.amenity === 'drinking_water') return 'Drinking Water';
  if (tags.amenity === 'restaurant') return 'Restaurant';
  if (tags.amenity === 'cafe') return 'Cafe';
  if (tags.amenity === 'fast_food') return 'Fast Food';
  if (tags.amenity === 'post_office') return 'Post Office';
  if (tags.amenity === 'courthouse') return 'Courthouse';
  if (tags.amenity === 'townhall') return 'Municipal Office / Townhall';
  if (tags.amenity === 'place_of_worship') return tags.religion ? `${tags.religion.charAt(0).toUpperCase() + tags.religion.slice(1)} Place of Worship` : 'Place of Worship';

  if (tags.tourism === 'hotel') return 'Hotel';
  if (tags.tourism === 'hostel') return 'Hostel';
  if (tags.tourism === 'guest_house') return 'Guest House';
  if (tags.tourism === 'museum') return 'Museum';
  if (tags.tourism === 'attraction') return 'Tourist Attraction';
  if (tags.tourism === 'zoo') return 'Zoo / Wildlife';
  if (tags.tourism === 'viewpoint') return 'Viewpoint';

  if (tags.leisure === 'park') return 'Public Park';
  if (tags.leisure === 'garden') return 'Botanical Garden';
  if (tags.leisure === 'playground') return 'Playground';
  if (tags.leisure === 'stadium') return 'Stadium';
  if (tags.leisure === 'sports_centre') return 'Sports Center';

  if (tags.railway === 'station') return 'Railway Station';
  if (tags.railway === 'subway_entrance') return 'Metro Station';
  if (tags.amenity === 'bus_station') return 'Bus Station';
  if (tags.amenity === 'fuel') return 'Fuel Station';
  if (tags.amenity === 'charging_station') return 'EV Charging Station';

  if (tags.shop === 'supermarket') return 'Supermarket';
  if (tags.shop === 'mall') return 'Shopping Mall';
  if (tags.shop === 'department_store') return 'Department Store';
  if (tags.shop === 'convenience') return 'Convenience Store';
  if (tags.amenity === 'marketplace') return 'Marketplace';

  if (tags.historic === 'monument') return 'Monument';
  if (tags.historic === 'memorial') return 'Memorial';
  if (tags.historic === 'fort') return 'Fort';

  const cat = getCategoryById(categoryId);
  return cat ? cat.label : 'Public Place';
}
