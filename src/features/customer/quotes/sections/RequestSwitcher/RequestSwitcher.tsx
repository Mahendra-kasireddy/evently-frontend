import { CalendarDays, MessageSquareQuote } from 'lucide-react';
import type { ApiQuoteRequestSummary } from '../../types';
import { REQUEST_STATUS_LABEL } from '../../constants';
import styles from './RequestSwitcher.module.css';

export interface RequestSwitcherProps {
  requests: ApiQuoteRequestSummary[];
  activeId: string;
  onSelect: (id: string) => void;
}

/**
 * One tab per quote request the customer has raised. Without it a customer with
 * several requests can only ever reach the quotations of whichever one the
 * screen happened to auto-select — the rest exist in the backend but have no
 * route into the UI.
 */
export function RequestSwitcher({ requests, activeId, onSelect }: RequestSwitcherProps) {
  if (requests.length < 2) return null;

  return (
    <nav className={styles.wrap} aria-label="Your quote requests">
      <div className={styles.scroll} role="tablist">
        {requests.map((r) => {
          const count = r.quotationCount ?? 0;
          const active = r.id === activeId;
          return (
            <button
              key={r.id}
              type="button"
              role="tab"
              aria-selected={active}
              className={`${styles.tab} ${active ? styles.tabOn : ''}`}
              onClick={() => onSelect(r.id)}
            >
              <span className={styles.top}>
                <span className={styles.occasion}>{r.occasion || 'Event'}</span>
                <span className={`${styles.status} ${styles[`s_${r.status}`] ?? ''}`}>
                  {REQUEST_STATUS_LABEL[r.status] ?? r.status}
                </span>
              </span>
              <span className={styles.meta}>
                {r.when && (
                  <span className={styles.metaItem}>
                    <CalendarDays size={12} /> {r.when}
                  </span>
                )}
                <span className={`${styles.metaItem} ${count > 0 ? styles.hasQuotes : ''}`}>
                  <MessageSquareQuote size={12} />
                  {count === 0 ? 'No quotes yet' : `${count} quote${count === 1 ? '' : 's'}`}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default RequestSwitcher;
