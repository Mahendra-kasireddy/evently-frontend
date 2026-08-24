import { FILTERS, matchesFilter } from '../constants';
import type { BoardFilter, Idea } from '../types';
import styles from '../board.module.css';

export interface BoardFiltersProps {
  value: BoardFilter;
  /** The whole feed, so each chip can show how much it would show. */
  items: Idea[];
  onChange: (next: BoardFilter) => void;
}

/**
 * The feed's filters. Each chip carries its own count so an empty slice is
 * visible before it is chosen, rather than after.
 */
export function BoardFilters({ value, items, onChange }: BoardFiltersProps) {
  return (
    <div className={styles.filters} role="tablist" aria-label="Filter the board">
      {FILTERS.map((f) => {
        const n = items.filter((i) => matchesFilter(i, f.value)).length;
        const on = value === f.value;
        return (
          <button
            key={f.value}
            type="button"
            role="tab"
            aria-selected={on}
            className={`${styles.filter} ${on ? styles.filterOn : ''}`}
            onClick={() => onChange(f.value)}
          >
            {f.label}
            {n > 0 && <span className={styles.filterCount}>{n}</span>}
          </button>
        );
      })}
    </div>
  );
}

export default BoardFilters;
