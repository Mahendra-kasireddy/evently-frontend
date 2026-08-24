import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './EventTrail.module.css';

export interface TrailCrumb {
  label: string;
  to: string;
}

export interface EventTrailProps {
  /** Ancestors, outermost first — each a link. The current page is `current`. */
  crumbs: TrailCrumb[];
  current: string;
}

/**
 * Breadcrumb trail for the My Events sub-pages, and the way back out of them.
 *
 * One control, not two: a separate "back" pill alongside a trail meant printing
 * the parent's name twice in a row ("‹ My Events   My Events › Wedding"). Instead
 * the trail carries a leading back chevron and every ancestor is a generously
 * padded link, so the immediate parent is one click and the whole hierarchy is
 * visible.
 *
 * Navigation is by route, never by browser history, so a page opened from a
 * notification or a shared link behaves exactly like one reached by clicking
 * through.
 */
export function EventTrail({ crumbs, current }: EventTrailProps) {
  return (
    <nav className={styles.wrap} aria-label="Breadcrumb">
      <ol className={styles.list}>
        {crumbs.map((c, i) => (
          <li key={c.to} className={styles.item}>
            <Link to={c.to} className={styles.crumb}>
              {i === 0 && <ChevronLeft size={15} className={styles.up} aria-hidden="true" />}
              {c.label}
            </Link>
            <ChevronRight size={13} className={styles.sep} aria-hidden="true" />
          </li>
        ))}
        <li className={styles.item}>
          <span className={styles.current} aria-current="page">{current}</span>
        </li>
      </ol>
    </nav>
  );
}
