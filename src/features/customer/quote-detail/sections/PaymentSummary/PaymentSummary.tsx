import { Check, MessageSquare, ShieldCheck, CheckCircle2 } from 'lucide-react';
import type { QuoteDetail } from '../../types';
import styles from './PaymentSummary.module.css';

export interface PaymentSummaryProps {
  q: QuoteDetail;
  onAccept: () => void;
  onReject: () => void;
  isActing?: boolean;
  /** True once this quotation has been accepted/rejected/withdrawn — actions are locked. */
  decided?: boolean;
}

export function PaymentSummary({ q, onAccept, onReject, isActing = false, decided = false }: PaymentSummaryProps) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <span className={styles.eyebrow}>GRAND TOTAL</span>
          <h3 className={styles.total}>{q.grandTotal}</h3>
          <span className={styles.note}>{q.grandNote}</span>
        </div>
        <div className={styles.body}>
          <div className={styles.row}><span>Subtotal</span><strong>{q.subtotal}</strong></div>
          <div className={styles.row}><span>{q.gstLabel}</span><strong>{q.gst}</strong></div>
          <div className={`${styles.row} ${styles.grand}`}><span>Grand total</span><strong>{q.grandTotal}</strong></div>
          <div className={styles.advance}>
            <div><small>{q.advanceLabel}</small><strong className={styles.advVal}>{q.advance}</strong></div>
            <div className={styles.right}><small>{q.balanceLabel}</small><strong>{q.balance}</strong></div>
          </div>

          {decided ? (
            <div className={styles.decided}>
              <CheckCircle2 size={16} /> This quote is {q.status.toLowerCase()}
            </div>
          ) : (
            <>
              <button type="button" className={styles.accept} onClick={onAccept} disabled={isActing}>
                <Check size={18} /> {isActing ? 'Working…' : 'Accept Quote'}
              </button>
              <div className={styles.altRow}>
                <button type="button" className={styles.alt} disabled={isActing}><MessageSquare size={15} /> Negotiate</button>
                <button type="button" className={styles.alt} onClick={onReject} disabled={isActing}>Decline</button>
              </div>
            </>
          )}
          <p className={styles.footnote}><ShieldCheck size={14} /> {q.footnote}</p>
        </div>
      </div>
    </aside>
  );
}
