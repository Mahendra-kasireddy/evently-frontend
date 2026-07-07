import type { SubvendorDraft } from '../../types';
import styles from './RateStep.module.css';

export interface RateStepProps {
  draft: SubvendorDraft;
  unit: string;
  setField: <K extends keyof SubvendorDraft>(key: K, value: SubvendorDraft[K]) => void;
}

export function RateStep({ draft, unit, setField }: RateStepProps) {
  return (
    <div className={styles.step}>
      <h1 className={styles.title}>Your rate card</h1>
      <p className={styles.subtitle}>Set your basic rate. You can change it anytime.</p>

      <label className={styles.label} htmlFor="sv-rate">Base rate</label>
      <div className={styles.field}>
        <span className={styles.prefix}>₹</span>
        <input
          id="sv-rate" className={styles.input} inputMode="numeric" value={draft.baseRate}
          onChange={(e) => setField('baseRate', e.target.value.replace(/\D/g, ''))} placeholder="15"
        />
        <span className={styles.suffix}>per {unit}</span>
      </div>

      <label className={styles.label} htmlFor="sv-min">Minimum order</label>
      <div className={styles.field}>
        <input
          id="sv-min" className={styles.input} inputMode="numeric" value={draft.minOrder}
          onChange={(e) => setField('minOrder', e.target.value.replace(/\D/g, ''))} placeholder="200"
        />
        <span className={styles.suffix}>{unit}s</span>
      </div>
    </div>
  );
}
