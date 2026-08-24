import { useMemo, useState } from 'react';
import { Check, Crosshair, MapPin, Search } from 'lucide-react';
import { LOCATION_COPY as COPY } from './constants';
import styles from './LocationPicker.module.css';

export type GeoState = 'idle' | 'asking' | 'granted' | 'denied' | 'unsupported' | 'unresolved';

export interface LocationPickerProps {
  /** Real city options from the API — never a hardcoded list. */
  cities: string[];
  citiesLoading?: boolean | undefined;
  selected?: string | undefined;
  onSelect: (city: string) => void;
  /** Recently chosen cities, newest first. Rendered only when non-empty. */
  recent?: string[] | undefined;
  /** Hide the "use my current location" affordance (e.g. in a compact menu). */
  hideDetect?: boolean | undefined;
  busy?: boolean | undefined;
}

/**
 * City chooser shared by onboarding and the header's location strip.
 *
 * "Use my current location" asks for the browser's permission and reports
 * honestly what happened. It deliberately does NOT invent a city name: the app
 * has no geocoding provider configured and `plan_cities` carries no
 * coordinates, so coordinates cannot be resolved to one of these options.
 * Wiring a geocoder later only has to fill in `onResolved` — the rest of this
 * component, and every screen using it, stays as is.
 */
export function LocationPicker({
  cities,
  citiesLoading,
  selected,
  onSelect,
  recent = [],
  hideDetect,
  busy,
}: LocationPickerProps) {
  const [query, setQuery] = useState('');
  const [geo, setGeo] = useState<GeoState>('idle');

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? cities.filter((c) => c.toLowerCase().includes(q)) : cities;
  }, [cities, query]);

  const detect = () => {
    if (!('geolocation' in navigator)) {
      setGeo('unsupported');
      return;
    }
    setGeo('asking');
    navigator.geolocation.getCurrentPosition(
      // Permission granted, but with no geocoder there is nothing truthful to
      // pre-select — so we say so and leave the choice to the customer.
      () => setGeo('unresolved'),
      (err) => setGeo(err.code === err.PERMISSION_DENIED ? 'denied' : 'unresolved'),
      { timeout: 8000, maximumAge: 300_000 },
    );
  };

  const geoNote =
    geo === 'asking'
      ? COPY.geoAsking
      : geo === 'denied'
        ? COPY.geoDenied
        : geo === 'unsupported'
          ? COPY.geoUnsupported
          : geo === 'unresolved'
            ? COPY.geoUnresolved
            : '';

  return (
    <div className={styles.wrap}>
      {!hideDetect && (
        <>
          <button type="button" className={styles.detect} onClick={detect} disabled={geo === 'asking'}>
            <Crosshair size={16} />
            {geo === 'asking' ? COPY.detecting : COPY.detect}
          </button>
          {geoNote && (
            <p className={styles.geoNote} role="status">
              {geoNote}
            </p>
          )}
        </>
      )}

      <div className={styles.searchWrap}>
        <Search size={15} className={styles.searchIcon} />
        <input
          className={styles.search}
          placeholder={COPY.searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label={COPY.searchPlaceholder}
        />
      </div>

      {recent.length > 0 && !query && (
        <>
          <p className={styles.groupLabel}>{COPY.recent}</p>
          <ul className={styles.list}>
            {recent.map((c) => (
              <li key={`recent-${c}`}>
                <button
                  type="button"
                  className={`${styles.city} ${c === selected ? styles.cityOn : ''}`}
                  onClick={() => onSelect(c)}
                  disabled={busy}
                >
                  <MapPin size={15} className={styles.pin} />
                  <span>{c}</span>
                  {c === selected && <Check size={15} className={styles.tick} />}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      <p className={styles.groupLabel}>{query ? COPY.results : COPY.allCities}</p>
      {citiesLoading ? (
        <ul className={styles.list} aria-busy="true">
          {[0, 1, 2, 3].map((i) => (
            <li key={i} className={styles.skeleton} />
          ))}
        </ul>
      ) : matches.length === 0 ? (
        <p className={styles.empty}>{COPY.noMatch}</p>
      ) : (
        <ul className={styles.list}>
          {matches.map((c) => (
            <li key={c}>
              <button
                type="button"
                className={`${styles.city} ${c === selected ? styles.cityOn : ''}`}
                onClick={() => onSelect(c)}
                disabled={busy}
              >
                <MapPin size={15} className={styles.pin} />
                <span>{c}</span>
                {c === selected && <Check size={15} className={styles.tick} />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default LocationPicker;
