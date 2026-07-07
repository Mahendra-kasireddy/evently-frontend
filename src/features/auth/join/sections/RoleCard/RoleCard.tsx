import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Truck, ChevronRight, Award } from 'lucide-react';
import type { JoinRole } from '../../types';
import styles from './RoleCard.module.css';

const ICONS: Record<JoinRole['icon'], ReactNode> = {
  briefcase: <Briefcase size={20} />,
  truck: <Truck size={20} />,
};

export function RoleCard({ role }: { role: JoinRole }) {
  const toneClass = role.tone === 'subvendor' ? styles.subvendor : styles.organizer;
  return (
    <article className={`${styles.card} ${toneClass}`}>
      <div className={styles.banner}>
        <span className={styles.icon}>{ICONS[role.icon]}</span>
        <span className={styles.badge}>
          {role.tone === 'organizer' && <Award size={13} />} {role.badge}
        </span>
        <div className={styles.stats}>
          {role.stats.map((s) => (
            <div key={s.label} className={styles.stat}>
              <span className={styles.statLabel}>{s.label}</span>
              <strong className={styles.statValue}>{s.value}</strong>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.body}>
        <h3 className={styles.title}>{role.title}</h3>
        <p className={styles.desc}>{role.description}</p>
        <Link to={role.to} className={styles.cta}>{role.cta} <ChevronRight size={16} /></Link>
      </div>
    </article>
  );
}
