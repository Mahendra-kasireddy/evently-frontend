import { ChevronLeft, Award, Star } from 'lucide-react';
import type { QuoteDetail, QdTier } from '../../types';
import styles from './QuoteDetailHero.module.css';

const TIER: Record<QdTier, string> = { Bronze: 'bronze', Silver: 'silver', Gold: 'gold', Platinum: 'platinum' };

export interface QuoteDetailHeroProps {
  q: QuoteDetail;
  /** Omit when the page carries its own breadcrumb trail with a back control. */
  onBack?: (() => void) | undefined;
  /** Names the destination — a bare arrow left customers guessing where it went. */
  backLabel?: string | undefined;
}

export function QuoteDetailHero({ q, onBack, backLabel }: QuoteDetailHeroProps) {
  return (
    <section className={styles.hero}>
      <span className={styles.circle} aria-hidden />
      {onBack && (
        <button
          type="button"
          className={`${styles.back} ${backLabel ? styles.backLabelled : ''}`}
          onClick={onBack}
          {...(backLabel ? {} : { 'aria-label': 'Back' })}
        >
          <ChevronLeft size={backLabel ? 15 : 18} />
          {backLabel}
        </button>
      )}
      <span className={styles.avatar} style={{ backgroundColor: q.avatarColor }}>{q.initials}</span>
      <div className={styles.info}>
        <div className={styles.nameRow}>
          <h1 className={styles.name}>{q.name}</h1>
          <span className={`${styles.badge} ${styles[TIER[q.tier]]}`}><Award size={12} /> {q.tier}</span>
        </div>
        <p className={styles.meta}><Star size={13} fill="currentColor" strokeWidth={0} className={styles.star} /> {q.rating} ({q.reviews}) · {q.receivedLabel}</p>
      </div>
      {q.status && <span className={styles.status}>{q.status}</span>}
    </section>
  );
}
