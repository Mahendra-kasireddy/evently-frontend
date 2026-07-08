import { CheckCircle2, AlertTriangle, Columns3, Share2, Check } from 'lucide-react';
import type { QuotesData } from '../../types';
import styles from './ComparisonTable.module.css';

export interface ComparisonTableProps {
  data: QuotesData;
  selected: string[];
  onAcceptBest: () => void;
}

export function ComparisonTable({ data, selected, onAcceptBest }: ComparisonTableProps) {
  const cols = data.columns.filter((c) => selected.includes(c.id));
  const bestVisible = selected.includes(data.bestId);

  return (
    <div className={styles.wrap}>
      <div className={styles.infoBar}>
        <CheckCircle2 size={18} className={styles.infoIcon} />
        <strong>{selected.length} selected</strong>&nbsp;— {selected.length < 2 ? 'select at least 2 to compare' : 'comparing side by side'}
      </div>

      {cols.length < 2 ? (
        <div className={styles.empty}>
          <Columns3 size={26} />
          <p>Select 2–3 quotes on the left to compare them line by line.</p>
        </div>
      ) : (
        <>
          <div className={styles.table}>
            <div className={`${styles.row} ${styles.header}`} style={{ gridTemplateColumns: `minmax(0, 1.5fr) repeat(${cols.length}, minmax(0, 1fr))` }}>
              <span className={styles.itemHead}>Item</span>
              {cols.map((c) => <span key={c.id} className={styles.colHead}>{c.label}</span>)}
            </div>
            {data.rows.map((r) => (
              <div key={r.label} className={`${styles.row} ${r.summary ? styles.summary : ''}`} style={{ gridTemplateColumns: `minmax(0, 1.5fr) repeat(${cols.length}, minmax(0, 1fr))` }}>
                <span className={styles.item}>{r.label}</span>
                {cols.map((c) => (
                  <span key={c.id} className={styles.cell}>
                    <span className={styles.val}>{r.values[c.id]}</span>
                    {bestVisible && c.id === data.bestId && <span className={styles.best}>BEST</span>}
                  </span>
                ))}
              </div>
            ))}
          </div>

          {data.anomaly && (
            <div className={styles.anomaly}>
              <AlertTriangle size={17} className={styles.anomalyIcon} />
              <div>
                <strong>Heads up: pricing anomaly</strong>
                <p>{data.anomaly} <a href="#why" className={styles.seeWhy}>See why ›</a></p>
              </div>
            </div>
          )}

          <div className={styles.actions}>
            <button type="button" className={styles.share}><Share2 size={16} /> Share with family</button>
            <button type="button" className={styles.acceptBest} onClick={onAcceptBest}><Check size={17} /> Accept best quote</button>
          </div>
        </>
      )}
    </div>
  );
}
