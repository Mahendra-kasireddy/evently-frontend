import { Phone, Search } from 'lucide-react';
import type { SubvendorDraft } from '../../types';
import styles from './LinkStep.module.css';

export interface LinkStepProps {
  draft: SubvendorDraft;
  setField: <K extends keyof SubvendorDraft>(key: K, value: SubvendorDraft[K]) => void;
}

export function LinkStep({ draft, setField }: LinkStepProps) {
  return (
    <div className={styles.step}>
      <h1 className={styles.title}>Link your organizers</h1>
      <p className={styles.subtitle}>Connect with the organizer who invited you.</p>

      <label className={styles.label} htmlFor="sv-org">Organizer phone</label>
      <div className={styles.field}>
        <span className={styles.cc}>+91</span>
        <Phone size={16} className={styles.phoneIcon} />
        <input
          id="sv-org" className={styles.input} inputMode="tel" value={draft.organizerPhone}
          onChange={(e) => setField('organizerPhone', e.target.value)} placeholder="98765 00011"
        />
      </div>

      <div className={styles.or}><span>— or —</span></div>

      <button type="button" className={styles.browse}>
        <Search size={17} /> Browse organizers near me
      </button>
    </div>
  );
}
