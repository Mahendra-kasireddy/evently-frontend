import { useState } from 'react';
import type { City } from '../../types';
import styles from './CityChips.module.css';

export function CityChips({ cities }: { cities: City[] }) {
  const [active, setActive] = useState<string | undefined>(undefined);
  const current = active ?? cities[0]?.id;
  return (
    <div className={styles.row} role="tablist" aria-label="City">
      {cities.map((c) => (
        <button
          key={c.id} type="button" role="tab" aria-selected={c.id === current}
          className={c.id === current ? styles.chipActive : styles.chip}
          onClick={() => setActive(c.id)}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}
