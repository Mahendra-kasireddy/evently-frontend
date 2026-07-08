import { MessageSquareQuote, ChevronRight } from 'lucide-react';
import type { PlanQuoteRequest, QuoteRequestStatus } from '../../types';
import styles from './WorkspaceSidebar.module.css';

const STATUS_LABEL: Record<QuoteRequestStatus, string> = {
  open: 'Awaiting quotes', quoted: 'Quote received', closed: 'Closed',
};
const STATUS_CLASS: Record<QuoteRequestStatus, string> = {
  open: 'open', quoted: 'quoted', closed: 'closed',
};

function timeLabel(iso?: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export interface WorkspaceSidebarProps {
  quotes: PlanQuoteRequest[];
  onBrowseQuotes: () => void;
}

export function WorkspaceSidebar({ quotes, onBrowseQuotes }: WorkspaceSidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.card}>
        <div className={styles.head}>
          <h3 className={styles.title}><MessageSquareQuote size={17} /> Quote status</h3>
          {quotes.length > 0 && (
            <button type="button" className={styles.all} onClick={onBrowseQuotes}>Compare</button>
          )}
        </div>

        {quotes.length === 0 ? (
          <p className={styles.empty}>No quote requests yet. Submit a plan and pick an organizer to request your first quote.</p>
        ) : (
          <ul className={styles.list}>
            {quotes.map((q) => (
              <li key={q.id} className={styles.item}>
                <span className={styles.avatar} style={{ backgroundColor: q.organizer?.avatarColor ?? '#7c5bd6' }}>
                  {q.organizer?.initials ?? '★'}
                </span>
                <div className={styles.body}>
                  <strong className={styles.name}>{q.organizer?.name ?? 'Matched organizers'}</strong>
                  <span className={styles.sub}>
                    {q.occasion}{q.when ? ` · ${q.when}` : ''}{timeLabel(q.createdAt) ? ` · ${timeLabel(q.createdAt)}` : ''}
                  </span>
                </div>
                <span className={`${styles.badge} ${styles[STATUS_CLASS[q.status]]}`}>{STATUS_LABEL[q.status]}</span>
              </li>
            ))}
          </ul>
        )}

        {quotes.length > 0 && (
          <button type="button" className={styles.cta} onClick={onBrowseQuotes}>
            Compare quotes <ChevronRight size={15} />
          </button>
        )}
      </div>
    </aside>
  );
}
