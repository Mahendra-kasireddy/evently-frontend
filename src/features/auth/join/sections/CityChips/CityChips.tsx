import { useState } from 'react';
import { CITY_CHIP_LIMIT, JOIN_COPY } from '../../constants';
import type { City } from '../../types';
import styles from './CityChips.module.css';

/**
 * The design shows four city chips plus a "+ more cities" chip. `/plan/cities`
 * returns the full list, so the extra chip expands it instead of the list being
 * truncated in the data layer.
 */
export function CityChips({ cities }: { cities: City[] }) {
  const [active, setActive] = useState<string | undefined>(undefined);
  const [expanded, setExpanded] = useState(false);
  const current = active ?? cities[0]?.id;
  const visible = expanded ? cities : cities.slice(0, CITY_CHIP_LIMIT);
  const hidden = cities.length - visible.length;

  return (
    <div className={styles.row} role="tablist" aria-label="City">
      {visible.map((c) => (
        <button
          key={c.id}
          type="button"
          role="tab"
          aria-selected={c.id === current}
          className={c.id === current ? styles.chipActive : styles.chip}
          onClick={() => setActive(c.id)}
        >
          {c.name}
        </button>
      ))}
      {hidden > 0 && (
        <button
          type="button"
          className={styles.chip}
          aria-label={`Show ${hidden} more cities`}
          onClick={() => setExpanded(true)}
        >
          {JOIN_COPY.moreCities}
        </button>
      )}
    </div>
  );
}
