import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, ChevronRight, Truck } from 'lucide-react';
import { Tier } from '@shared/partner';
import type { JoinRole } from '../../types';
import styles from './RoleCard.module.css';

const ICONS: Record<JoinRole['icon'], ReactNode> = {
  briefcase: <Briefcase size={24} />,
  truck: <Truck size={24} />,
};

/** One of the two portal tiles — the whole tile is the link, as in the design. */
export function RoleCard({ role }: { role: JoinRole }) {
  const toneClass = role.tone === 'subvendor' ? styles.subvendor : styles.organizer;
  return (
    <Link to={role.to} className={`${styles.card} ${toneClass}`}>
      <div className={styles.banner}>
        <div className={styles.bannerTop}>
          <span className={styles.icon}>{ICONS[role.icon]}</span>
          {role.tone === 'organizer' ? (
            <Tier tier={role.badge} sm />
          ) : (
            <span className={styles.scoreBadge}>{role.badge}</span>
          )}
        </div>
        <div className={styles.stats}>
          {role.stats.map((s) => (
            <div key={s.label} className={styles.stat}>
              <span className={styles.statLabel}>{s.label}</span>
              <span className={s.tone === 'teal' ? styles.statValueTeal : styles.statValue}>
                {s.value}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.body}>
        <h2 className={styles.title}>{role.title}</h2>
        <p className={styles.desc}>{role.description}</p>
        <span className={styles.cta}>
          {role.cta} <ChevronRight size={16} />
        </span>
      </div>
    </Link>
  );
}
