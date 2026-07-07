import { VENDOR_CATEGORIES } from '../../constants';
import type { SubvendorDraft } from '../../types';
import styles from './DetailsStep.module.css';

export interface DetailsStepProps {
  draft: SubvendorDraft;
  setField: <K extends keyof SubvendorDraft>(key: K, value: SubvendorDraft[K]) => void;
}

export function DetailsStep({ draft, setField }: DetailsStepProps) {
  return (
    <div className={styles.step}>
      <h1 className={styles.title}>Your details</h1>
      <p className={styles.subtitle}>Tell us what you do and where.</p>

      <label className={styles.label} htmlFor="sv-name">Full name</label>
      <input
        id="sv-name" className={styles.input} value={draft.fullName}
        onChange={(e) => setField('fullName', e.target.value)} placeholder="Ramesh Kumar"
      />

      <p className={styles.label}>Your category (pick one)</p>
      <div className={styles.grid} role="radiogroup" aria-label="Your category">
        {VENDOR_CATEGORIES.map((c) => {
          const Icon = c.icon;
          const selected = draft.categoryId === c.id;
          return (
            <button
              key={c.id} type="button" role="radio" aria-checked={selected}
              className={`${styles.tile} ${selected ? styles.tileOn : ''}`}
              onClick={() => setField('categoryId', c.id)}
            >
              <Icon size={18} className={styles.tileIcon} />
              <span>{c.label}</span>
            </button>
          );
        })}
      </div>

      <label className={styles.label} htmlFor="sv-area">Service area</label>
      <input
        id="sv-area" className={styles.input} value={draft.serviceArea}
        onChange={(e) => setField('serviceArea', e.target.value)}
        placeholder="Hyderabad · Kukatpally, Miyapur"
      />
    </div>
  );
}
