import { Phone, Search } from 'lucide-react';
import type { SubvendorDraft, SubvendorFieldErrors } from '../../types';
import styles from '../Step.module.css';

export interface LinkStepProps {
  draft: SubvendorDraft;
  errors: SubvendorFieldErrors;
  setField: <K extends keyof SubvendorDraft>(key: K, value: SubvendorDraft[K]) => void;
}

export function LinkStep({ draft, errors, setField }: LinkStepProps) {
  return (
    <div className={styles.step}>
      <p className={styles.eyebrow}>STEP 3 OF 3</p>
      <h1 className={styles.title}>Link your organizers</h1>
      <p className={styles.subtitle}>
        If an organizer invited you, enter their number and you’ll be connected straight away.
      </p>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="sv-org">
          Organizer’s mobile <span className={styles.optional}>· optional</span>
        </label>
        <div className={`${styles.combo} ${errors.organizerPhone ? styles.comboBad : ''}`}>
          <span className={`${styles.affix} ${styles.affixStart}`}>
            <Phone size={15} /> +91
          </span>
          <input
            id="sv-org"
            className={styles.comboInput}
            type="tel"
            inputMode="numeric"
            maxLength={10}
            value={draft.organizerPhone}
            onChange={(e) => setField('organizerPhone', e.target.value.replace(/\D/g, ''))}
            placeholder="98765 00011"
            aria-invalid={errors.organizerPhone ? true : undefined}
          />
        </div>
        {errors.organizerPhone ? (
          <p className={styles.err} role="alert">
            {errors.organizerPhone}
          </p>
        ) : (
          <span className={styles.hint}>
            You can skip this — organizers can also invite you later.
          </span>
        )}
      </div>

      <div className={styles.or}>
        <span>or</span>
      </div>

      {/*
        Disabled, and it says why. There is no organizer-discovery endpoint for
        sub-vendors in the API, so this button did nothing at all when clicked —
        an affordance that silently ignores you is worse than one that explains
        itself.
      */}
      <button type="button" className={styles.browse} disabled title="Not available yet">
        <Search size={17} /> Browse organizers near me
      </button>
      <p className={styles.browseNote}>
        Browsing organizers isn’t available yet. Finish setup and organizers can find you.
      </p>
    </div>
  );
}
