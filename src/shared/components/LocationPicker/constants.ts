export const LOCATION_COPY = {
  detect: 'Use my current location',
  detecting: 'Checking your location…',
  searchPlaceholder: 'Search for your city',
  recent: 'RECENT',
  allCities: 'CITIES WE COVER',
  results: 'RESULTS',
  noMatch: 'No city matches that. Try a nearby city.',
  geoAsking: 'Waiting for your browser’s location permission…',
  geoDenied: 'Location access is off, so pick your city below — you can change it any time.',
  geoUnsupported: 'This browser can’t share a location. Pick your city below.',
  geoUnresolved:
    'Thanks — we have your position, but we can’t name the city automatically yet. Confirm it below.',
} as const;

/** localStorage key for the last few cities the customer chose. */
export const RECENT_CITIES_KEY = 'evently.recentCities';
export const RECENT_CITIES_MAX = 3;
