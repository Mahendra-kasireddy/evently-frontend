import { Clock } from 'lucide-react';
import type { Idea } from '../types';
import styles from '../board.module.css';

export interface AwaitingCardProps {
  /** Posts whose approval is outstanding. */
  items: Idea[];
  role: 'customer' | 'organizer';
  /** Jumps the feed to the matching filter. */
  onReview: () => void;
}

/**
 * The outstanding approvals, listed from the posts themselves — the title is
 * what the organizer actually asked for, and the sub-line is the idea it came
 * from. Nothing is listed that the feed does not also contain.
 */
export function AwaitingCard({ items, role, onReview }: AwaitingCardProps) {
  if (items.length === 0) return null;
  const isOrg = role === 'organizer';

  return (
    <section className={styles.railCard}>
      <div className={styles.railHead}>
        <h2 className={styles.railTitle}>
          {isOrg ? 'Awaiting their approval' : 'Awaiting your approval'}
        </h2>
        <span className={styles.railBadge}>{items.length}</span>
      </div>
      {items.map((idea) => (
        <div key={idea.id} className={styles.apItem}>
          <span className={styles.apIcon}>
            <Clock size={16} />
          </span>
          <span className={styles.apText}>
            <strong>{idea.approvalLabel || 'Needs a decision'}</strong>
            <span>{idea.text}</span>
          </span>
          <button type="button" className={styles.apReview} onClick={onReview}>
            {isOrg ? 'Open' : 'Review'}
          </button>
        </div>
      ))}
    </section>
  );
}

export default AwaitingCard;
