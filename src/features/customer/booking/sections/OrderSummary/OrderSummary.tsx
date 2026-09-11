import { Lock, ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import type { BookingData } from '../../types';
import styles from './OrderSummary.module.css';

/**
 * What is being paid, and the one button that pays it.
 *
 * The coupon control is passed in rather than built here: this panel renders
 * amounts, and every amount it renders — including the discounted ones — was
 * computed on the server. It multiplies nothing.
 */
export function OrderSummary({
  data,
  onConfirm,
  isCreating = false,
  coupon,
}: {
  data: BookingData;
  onConfirm: () => void;
  isCreating?: boolean;
  coupon?: ReactNode;
}) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <span className={styles.eyebrow}>{data.payNowLabel}</span>
          <h3 className={styles.amount}>{data.payNow}</h3>
          <span className={styles.note}>{data.balanceNote}</span>
        </div>
        <div className={styles.body}>
          <p className={styles.sumLabel}>ORDER SUMMARY</p>
          <ul className={styles.rows}>
            {data.summary.map((r) => (
              <li key={r.label} className={styles.row}>
                <span>{r.label}</span>
                <strong>{r.value}</strong>
              </li>
            ))}
          </ul>
          {coupon}
          <div className={styles.grand}>
            <span>Grand total</span>
            <strong>
              {/* The old total stays visible, struck through: a number that
                  simply got smaller invites a second look at the quote. */}
              {data.grandTotalBefore ? (
                <s className={styles.was}>{data.grandTotalBefore}</s>
              ) : null}
              {data.grandTotal}
            </strong>
          </div>
          <button
            type="button"
            className={styles.confirm}
            onClick={onConfirm}
            disabled={isCreating}
          >
            <Lock size={16} /> {isCreating ? 'Confirming…' : data.confirmLabel}
          </button>
          <p className={styles.footnote}>
            <ShieldCheck size={14} /> {data.footnote}
          </p>
        </div>
      </div>
    </aside>
  );
}
