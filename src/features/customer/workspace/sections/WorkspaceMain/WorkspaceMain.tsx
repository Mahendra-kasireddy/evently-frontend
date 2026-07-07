import { Sparkles, Heart, ChevronRight } from 'lucide-react';
import type { WorkspaceData, CatStatus } from '../../types';
import styles from './WorkspaceMain.module.css';

const DOT: Record<CatStatus, string> = { 'On track': styles.dotOk ?? '', 'In progress': styles.dotProgress ?? '', 'Action needed': styles.dotAction ?? '' };
const STAT: Record<CatStatus, string> = { 'On track': styles.sOk ?? '', 'In progress': styles.sProgress ?? '', 'Action needed': styles.sAction ?? '' };

export interface WorkspaceMainProps {
  d: WorkspaceData;
  onIdeas: () => void;
  onReview: () => void;
}

export function WorkspaceMain({ d, onIdeas, onReview }: WorkspaceMainProps) {
  return (
    <div className={styles.col}>
      <h2 className={styles.section}>Ideas &amp; planning board</h2>
      <div className={styles.banner}>
        <span className={styles.bIcon}><Sparkles size={18} /></span>
        <div className={styles.bText}><strong>{d.ideas.title}</strong><small>{d.ideas.meta}</small></div>
        <button type="button" className={styles.bCta} onClick={onIdeas}>{d.ideas.cta} <ChevronRight size={15} /></button>
      </div>

      <h2 className={styles.section}>Guest invitation</h2>
      <div className={styles.invite}>
        <span className={styles.iIcon}><Heart size={18} /></span>
        <div className={styles.bText}><strong>{d.invitation.title}</strong><small className={styles.iMeta}>{d.invitation.meta}</small></div>
        <button type="button" className={styles.iCta} onClick={onReview}>{d.invitation.cta} <ChevronRight size={15} /></button>
      </div>

      <h2 className={styles.section}>Category progress</h2>
      <div className={styles.grid}>
        {d.categories.map((c) => (
          <article key={c.id} className={styles.cat}>
            <div className={styles.catHead}>
              <span className={`${styles.dot} ${DOT[c.status]}`} />
              <strong className={styles.catName}>{c.name}</strong>
              <span className={`${styles.status} ${STAT[c.status]}`}>{c.status}</span>
            </div>
            <p className={styles.sub}>Sub-vendor: <strong>{c.subVendor}</strong></p>
            <p className={styles.desc}>{c.desc}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
