import { ChevronLeft, ShieldCheck, Award, Star, MapPin } from 'lucide-react';
import type { OrganizerProfile, ProfileTier } from '../../types';
import styles from './ProfileHeader.module.css';

const TIER: Record<ProfileTier, string> = { Bronze: 'bronze', Silver: 'silver', Gold: 'gold', Platinum: 'platinum' };

export function ProfileHeader({ p, onBack }: { p: OrganizerProfile; onBack: () => void }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.cover}>
        <button type="button" className={styles.back} onClick={onBack} aria-label="Back"><ChevronLeft size={18} /></button>
        <span className={styles.circle} aria-hidden />
      </div>
      <div className={styles.body}>
        <div className={styles.idRow}>
          <span className={styles.avatar} style={{ backgroundColor: p.avatarColor }}>{p.initials}</span>
          {p.certified && <span className={styles.certified}><ShieldCheck size={14} /> Evently Certified</span>}
        </div>
        <div className={styles.nameRow}>
          <h1 className={styles.name}>{p.name}</h1>
          <span className={`${styles.badge} ${styles[TIER[p.tier]]}`}><Award size={13} /> {p.tier}</span>
        </div>
        <p className={styles.meta}>
          <span className={styles.stars}>{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} fill="currentColor" strokeWidth={0} />)}</span>
          <strong>{p.rating}</strong> <span className={styles.muted}>({p.reviews})</span>
          <span className={styles.dot}>·</span><MapPin size={14} className={styles.pin} /> {p.location}
        </p>
        <div className={styles.stats}>
          {p.stats.map((s) => (
            <div key={s.label} className={styles.stat}>
              <strong>{s.value}</strong>
              <small>{s.label}</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
