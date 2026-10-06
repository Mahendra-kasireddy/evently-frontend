import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import styles from './BottomTabs.module.css';

export interface BottomTabItem {
  id: string;
  label: string;
  to: string;
  icon: LucideIcon;
  /** True when this tab owns the current URL. Each shell already works it out. */
  active?: boolean;
  /** A count to show on the tab — unread messages, unanswered enquiries. */
  badge?: number;
}

export interface BottomTabsProps {
  items: BottomTabItem[];
  /** For the landmark, since a page may hold more than one navigation. */
  ariaLabel: string;
}

/**
 * The phone's navigation bar.
 *
 * Shown under 760px and nowhere else — above that the side rail is the better
 * shape, because a desktop has width to spare and no thumb at the bottom of
 * the screen. Below it the rail was the wrong edge entirely: it ate a slice of
 * an already narrow viewport and, under 1000px, collapsed to unlabelled icons
 * that could only be identified by guessing.
 *
 * At most five. A sixth tab is not a smaller tab, it is an unreadable one, so
 * a shell with more destinations than this passes its five most-used and
 * leaves the rest to its own menu.
 *
 * Shared by every shell in the app — the customer's, the organizer's and the
 * sub-vendor's — so there is one bar to keep working rather than three that
 * drift.
 */
export function BottomTabs({ items, ariaLabel }: BottomTabsProps) {
  const shown = items.slice(0, 5);

  return (
    <nav className={styles.bar} aria-label={ariaLabel}>
      {shown.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.id}
            to={item.to}
            className={`${styles.tab} ${item.active ? styles.active : ''}`}
            aria-current={item.active ? 'page' : undefined}
          >
            <Icon aria-hidden />
            {/*
              The count is read out with the label rather than left as a bare
              number: "Enquiries, 3 new" is an answer, "3" beside an icon is a
              riddle for anybody using a screen reader.
            */}
            {item.badge ? (
              <span className={styles.badge} aria-hidden>
                {item.badge > 9 ? '9+' : item.badge}
              </span>
            ) : null}
            <span className={styles.label}>{item.label}</span>
            {item.badge ? (
              <span className={styles.srOnly}>{`${item.badge} new`}</span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

/**
 * The room the bar takes, given back at the foot of the content.
 *
 * Rendered as the last thing inside a shell's scrolling area. The bar is fixed,
 * so without this it covers the final row of every screen — a table's last
 * line, a form's submit button — and that row can never be reached.
 */
export function BottomTabsSpacer() {
  return <div className={styles.spacer} aria-hidden />;
}

export default BottomTabs;
