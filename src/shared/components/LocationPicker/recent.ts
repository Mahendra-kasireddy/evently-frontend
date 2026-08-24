import { RECENT_CITIES_KEY, RECENT_CITIES_MAX } from './constants';

/**
 * Recently chosen cities. A convenience list, not data the product depends on,
 * so it lives in localStorage rather than adding a backend field; the city that
 * matters is the one persisted on the user profile.
 */
export function readRecentCities(): string[] {
  try {
    const raw = window.localStorage.getItem(RECENT_CITIES_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((c): c is string => typeof c === 'string') : [];
  } catch {
    return [];
  }
}

export function rememberCity(city: string): void {
  if (!city.trim()) return;
  try {
    const next = [city, ...readRecentCities().filter((c) => c !== city)].slice(0, RECENT_CITIES_MAX);
    window.localStorage.setItem(RECENT_CITIES_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable — recents are a nicety, not a requirement */
  }
}
