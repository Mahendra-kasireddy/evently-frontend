import { OTHER_CATEGORY_ID } from '../../constants';
import type { SubvendorDraft, SubvendorFieldErrors } from '../../types';
import styles from '../Step.module.css';

export interface RateStepProps {
  draft: SubvendorDraft;
  unit: string;
  errors: SubvendorFieldErrors;
  setField: <K extends keyof SubvendorDraft>(key: K, value: SubvendorDraft[K]) => void;
}

export function RateStep({ draft, unit, errors, setField }: RateStepProps) {
  // A trade Evently has no category for has no known unit of sale either, so
  // the copy says "job" rather than inventing "per plate" for a sound engineer.
  const isOther = draft.categoryId === OTHER_CATEGORY_ID;

  return (
    <div className={styles.step}>
      <p className={styles.eyebrow}>STEP 2 OF 3</p>
      <h1 className={styles.title}>Your rate card</h1>
      <p className={styles.subtitle}>
        A starting point, not a commitment — you can change it any time from your profile.
      </p>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="sv-rate">
          Base rate <span className={styles.optional}>· optional</span>
        </label>
        <div className={`${styles.combo} ${errors.baseRate ? styles.comboBad : ''}`}>
          <span className={`${styles.affix} ${styles.affixStart}`}>₹</span>
          <input
            id="sv-rate"
            className={styles.comboInput}
            inputMode="numeric"
            value={draft.baseRate}
            onChange={(e) => setField('baseRate', e.target.value.replace(/\D/g, ''))}
            placeholder="15"
            aria-invalid={errors.baseRate ? true : undefined}
          />
          <span className={`${styles.affix} ${styles.affixEnd}`}>per {unit}</span>
        </div>
        {errors.baseRate ? (
          <p className={styles.err} role="alert">
            {errors.baseRate}
          </p>
        ) : (
          <span className={styles.hint}>
            {isOther
              ? 'We don’t know how your trade is usually priced yet, so this is per job.'
              : `What you'd normally charge per ${unit}.`}
          </span>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="sv-min">
          Minimum order <span className={styles.optional}>· optional</span>
        </label>
        <div className={styles.combo}>
          <input
            id="sv-min"
            className={styles.comboInput}
            inputMode="numeric"
            value={draft.minOrder}
            onChange={(e) => setField('minOrder', e.target.value.replace(/\D/g, ''))}
            placeholder="200"
          />
          <span className={`${styles.affix} ${styles.affixEnd}`}>{unit}s</span>
        </div>
        <span className={styles.hint}>
          The smallest job worth your while. Leave blank if you don’t have one.
        </span>
      </div>
    </div>
  );
}
