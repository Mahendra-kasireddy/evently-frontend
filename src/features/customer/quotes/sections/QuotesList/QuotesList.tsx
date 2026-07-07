import { Check, Award, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { QuoteCard, QuoteTier } from '../../types';
import styles from './QuotesList.module.css';

const TIER: Record<QuoteTier, string> = { Bronze: 'bronze', Silver: 'silver', Gold: 'gold', Platinum: 'platinum' };

export interface QuotesListProps {
  quotes: QuoteCard[];
  selected: string[];
  onToggle: (id: string) => void;
}

export function QuotesList({ quotes, selected, onToggle }: QuotesListProps) {
  const navigate = useNavigate();
  return (
    <div className={styles.col}>
      <h2 className={styles.title}>{quotes.length} quotes received</h2>
      <p className={styles.subtitle}>Select 2–3 to compare side by side.</p>
      <div className={styles.list}>
        {quotes.map((q) => {
          const on = selected.includes(q.id);
          return (
            <button key={q.id} type="button" className={`${styles.card} ${on ? styles.on : ''}`} onClick={() => onToggle(q.id)}>
              <div className={styles.head}>
                <span className={`${styles.box} ${on ? styles.boxOn : ''}`}>{on && <Check size={14} strokeWidth={3} />}</span>
                <span className={styles.avatar} style={{ backgroundColor: q.avatarColor }}>{q.initials}</span>
                <div className={styles.who}>
                  <div className={styles.nameRow}><strong>{q.name}</strong><span className={`${styles.badge} ${styles[TIER[q.tier]]}`}><Award size={11} /> {q.tier}</span></div>
                  <small>{q.received}</small>
                </div>
              </div>
              <div className={styles.foot}>
                <div className={styles.total}><small>GRAND TOTAL</small><strong>{q.grandTotal}</strong></div>
                {q.status && <span className={`${styles.status} ${q.status === 'New' ? styles.statusNew : styles.statusRev}`}>{q.status}</span>}
              </div>
              <span className={styles.detail} role="link" tabIndex={0} onClick={(e) => { e.stopPropagation(); navigate(`/quote/${q.id}`); }} onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); navigate(`/quote/${q.id}`); } }}>View full quote <ChevronRight size={13} /></span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
