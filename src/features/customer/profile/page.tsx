import { Heart } from 'lucide-react';
import { useGetProfileSummaryQuery } from '@features/customer/home/profile.service';
import { useAuth } from '@app/auth';
import styles from './styles.module.css';

/** Read-only account overview reached from the header profile menu. */
export function ProfilePage() {
  const { data: profile } = useGetProfileSummaryQuery();
  const { user } = useAuth();

  const name = profile?.name ?? user?.name ?? 'Your account';
  const email = user?.email ?? '—';
  const initials = profile?.initials ?? 'U';
  const location = profile?.location ?? '—';

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.head}>
          <span className={styles.avatar}>{initials}</span>
          <div>
            <h1 className={styles.name}>{name}</h1>
            <p className={styles.email}>{email}</p>
            <span className={styles.pill}>
              <Heart size={12} /> Customer
            </span>
          </div>
        </div>

        <div className={styles.grid}>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Account details</h2>
            <div className={styles.row}>
              <span className={styles.rowKey}>Full name</span>
              <span className={styles.rowVal}>{name}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.rowKey}>Email</span>
              <span className={styles.rowVal}>{email}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.rowKey}>Location</span>
              <span className={styles.rowVal}>{location}</span>
            </div>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Membership</h2>
            <div className={styles.row}>
              <span className={styles.rowKey}>Plan</span>
              <span className={styles.rowVal}>Customer</span>
            </div>
            <div className={styles.row}>
              <span className={styles.rowKey}>Status</span>
              <span className={styles.rowVal}>Active</span>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default ProfilePage;
