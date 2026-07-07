import { Plus, Share2 } from 'lucide-react';
import type { WorkspaceData } from '../../types';
import styles from './WorkspaceSidebar.module.css';

export function WorkspaceSidebar({ d }: { d: WorkspaceData }) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.card}>
        <span className={styles.orgAvatar} style={{ backgroundColor: d.organizer.color }}>{d.organizer.initials}</span>
        <div><strong className={styles.orgName}>{d.organizer.name}</strong><small className={styles.orgNote}>{d.organizer.note}</small></div>
      </div>

      <div className={styles.card}>
        <div className={styles.famHead}>
          <h3 className={styles.cardTitle}>{d.familyTitle}</h3>
        </div>
        <div className={styles.famRow}>
          <div className={styles.avatars}>
            {d.family.map((m) => <span key={m.initials} className={styles.avatar} style={{ backgroundColor: m.color }}>{m.initials}</span>)}
            <span className={styles.add}><Plus size={16} /></span>
          </div>
          <button type="button" className={styles.invite}><Share2 size={14} /> Invite</button>
        </div>
      </div>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>{d.timelineTitle}</h3>
        <ul className={styles.timeline}>
          {d.timeline.map((t, i) => (
            <li key={t.time} className={styles.tItem}>
              <span className={`${styles.tDot} ${t.done ? styles.tDotDone : ''}`} />
              {i < d.timeline.length - 1 && <span className={styles.tLine} />}
              <div className={styles.tText}><strong>{t.time}</strong><small>{t.label}</small></div>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
