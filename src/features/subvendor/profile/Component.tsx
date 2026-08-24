import { formatINR } from '@features/subvendor/tasks/transform';
import { CATEGORY_LABEL } from './constants';
import type { SubVendorProfile } from './types';
import type { OrganizerRef } from '@features/subvendor/payments/types';
import styles from './styles.module.css';

export interface ProfileComponentProps {
  profile: SubVendorProfile;
  organizers: OrganizerRef[];
}

export function Component({ profile, organizers }: ProfileComponentProps) {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Profile</h1>

        <section className={styles.card}>
          <span className={styles.avatar} style={{ backgroundColor: profile.avatarColor }}>
            {profile.initials}
          </span>
          <div className={styles.info}>
            <strong className={styles.name}>{profile.fullName}</strong>
            <span className={styles.category}>{CATEGORY_LABEL[profile.category] ?? profile.category}</span>
          </div>
        </section>

        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Details</h2>
          <div className={styles.row}><span>Service area</span><strong>{profile.serviceArea || 'Not set'}</strong></div>
          <div className={styles.row}>
            <span>Base rate</span>
            <strong>{profile.baseRate ? `${formatINR(profile.baseRate)} per ${profile.baseRateUnit}` : 'Not set'}</strong>
          </div>
          <div className={styles.row}>
            <span>Minimum order</span>
            <strong>{profile.minOrder ? `${profile.minOrder} ${profile.baseRateUnit}s` : 'Not set'}</strong>
          </div>
        </section>

        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>My organizers</h2>
          {organizers.length ? (
            <div className={styles.orgList}>
              {organizers.map((o) => (
                <span key={o.id} className={styles.orgChip}>{o.name}</span>
              ))}
            </div>
          ) : (
            <p className={styles.empty}>Not linked to any organizer yet.</p>
          )}
        </section>
      </div>
    </main>
  );
}
