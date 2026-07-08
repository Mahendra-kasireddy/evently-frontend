import { History } from 'lucide-react';
import type { ApiTimelineEvent } from '../../types';
import styles from './QuoteTimeline.module.css';

function at(iso?: string): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

const TERMINAL = new Set(['cancelled', 'rejected', 'withdrawn']);

export function QuoteTimeline({ events }: { events: ApiTimelineEvent[] }) {
  if (!events.length) return null;
  return (
    <div className={styles.card}>
      <h3 className={styles.title}><History size={16} /> Status timeline</h3>
      <ul className={styles.list}>
        {events.map((e, i) => (
          <li key={`${e.key}-${i}`} className={styles.item}>
            <span className={`${styles.dot} ${TERMINAL.has(e.key) ? styles.dotMuted : ''}`} />
            <span className={styles.label}>{e.label}</span>
            {at(e.at) && <span className={styles.at}>{at(e.at)}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
