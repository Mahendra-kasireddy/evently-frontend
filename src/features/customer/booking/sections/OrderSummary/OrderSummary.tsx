import { Lock, ShieldCheck } from 'lucide-react';
import type { BookingData } from '../../types';
import styles from './OrderSummary.module.css';

export function OrderSummary({ data, onConfirm }: { data: BookingData; onConfirm: () => void }) {
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
              <li key={r.label} className={styles.row}><span>{r.label}</span><strong>{r.value}</strong></li>
            ))}
          </ul>
          <div className={styles.grand}><span>Grand total</span><strong>{data.grandTotal}</strong></div>
          <button type="button" className={styles.confirm} onClick={onConfirm}><Lock size={16} /> {data.confirmLabel}</button>
          <p className={styles.footnote}><ShieldCheck size={14} /> {data.footnote}</p>
        </div>
      </div>
    </aside>
  );
}
