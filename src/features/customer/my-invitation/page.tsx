import { Link } from 'react-router-dom';
import { Heart, Sparkles } from 'lucide-react';
import styles from './styles.module.css';

/** Invitation placeholder reached from the header profile menu. */
export function MyInvitationPage() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>My invitation</h1>
        <p className={styles.subtitle}>Design and share the invite for your event.</p>

        <div className={styles.empty}>
          <span className={styles.emptyIcon}>
            <Heart size={28} />
          </span>
          <h2 className={styles.emptyTitle}>No invitation yet</h2>
          <p className={styles.emptyText}>
            Once you book an organizer, you can create a beautiful invitation here and share it
            with your guests in a couple of clicks.
          </p>
          <Link to="/plan" className={styles.cta}>
            <Sparkles size={16} /> Start planning
          </Link>
        </div>
      </div>
    </main>
  );
}

export default MyInvitationPage;
