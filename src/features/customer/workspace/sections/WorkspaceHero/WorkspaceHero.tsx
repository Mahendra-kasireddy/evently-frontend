import { ChevronLeft } from 'lucide-react';
import type { WorkspaceData } from '../../types';
import styles from './WorkspaceHero.module.css';

export function WorkspaceHero({ d, onBack }: { d: WorkspaceData; onBack: () => void }) {
  const r = 34, c = 2 * Math.PI * r, off = c * (1 - d.progress / 100);
  return (
    <section className={styles.hero}>
      <span className={styles.circle} aria-hidden />
      <button type="button" className={styles.back} onClick={onBack} aria-label="Back"><ChevronLeft size={18} /></button>
      <div className={styles.ring}>
        <svg width="82" height="82" viewBox="0 0 82 82">
          <circle cx="41" cy="41" r={r} className={styles.track} />
          <circle cx="41" cy="41" r={r} className={styles.fill} strokeDasharray={c} strokeDashoffset={off} transform="rotate(-90 41 41)" />
        </svg>
        <span className={styles.ringText}><strong>{d.progress}%</strong><small>complete</small></span>
      </div>
      <div className={styles.info}>
        <span className={styles.eyebrow}>{d.eyebrow}</span>
        <h1 className={styles.heading}>{d.heading}</h1>
        <p className={styles.subline}>{d.subline}</p>
      </div>
      <div className={styles.countdown}>
        {([['days', d.countdown.days, 'Days'], ['hrs', d.countdown.hrs, 'Hrs'], ['min', d.countdown.min, 'Min']] as const).map(([k, v, l]) => (
          <div key={k} className={styles.cd}><strong>{v}</strong><small>{l}</small></div>
        ))}
      </div>
    </section>
  );
}
