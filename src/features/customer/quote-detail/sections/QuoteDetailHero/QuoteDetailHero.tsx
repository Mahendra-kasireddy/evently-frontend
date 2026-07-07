import { ChevronLeft, Award, Star } from 'lucide-react';
import type { QuoteDetail, QdTier } from '../../types';
import styles from './QuoteDetailHero.module.css';

const TIER: Record<QdTier, string> = { Bronze: 'bronze', Silver: 'silver', Gold: 'gold', Platinum: 'platinum' };

export function QuoteDetailHero({ q, onBack }: { q: QuoteDetail; onBack: () => void }) {
  return (
    <section className={styles.hero}>
      <span className={styles.circle} aria-hidden />
      <button type="button" className={styles.back} onClick={onBack} aria-label="Back"><ChevronLeft size={18} /></button>
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
