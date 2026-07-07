import { Camera } from 'lucide-react';
import type { ProfileTile } from '../../types';
import styles from './Portfolio.module.css';

export function Portfolio({ tiles }: { tiles: ProfileTile[] }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Portfolio</h2>
      <div className={styles.grid}>
        {tiles.map((t) => (
          <div key={t.id} className={styles.tile} style={{ backgroundColor: t.color }}><Camera size={22} /></div>
        ))}
      </div>
    </section>
  );
}
