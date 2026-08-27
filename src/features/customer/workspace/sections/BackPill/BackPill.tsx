import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import styles from './BackPill.module.css';

export interface BackPillProps {
  /** Where "back" goes. A route, never browser history — see below. */
  to: string;
  /** The destination's name, so the control says where it leads. */
  label: string;
}

/**
 * The one back control for pages one level inside My Events.
 *
 * There used to be three: this pill on the booked-event workspace, a bare
 * icon-only square on the invitation screen, and a breadcrumb on the comparison
 * screens — so "back" looked like a different control on every page and, on the
 * square, did not say where it led.
 *
 * Deeper pages use `EventTrail` instead, which shows the whole hierarchy.
 *
 * Navigation is by route, never `navigate(-1)`, so a page opened from a
 * notification or a shared link behaves exactly like one reached by clicking.
 */
export function BackPill({ to, label }: BackPillProps) {
  return (
    <Link to={to} className={styles.back}>
      <ChevronLeft size={16} />
      {label}
    </Link>
  );
}

export default BackPill;
