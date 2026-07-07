import { MapPin } from 'lucide-react';
import styles from './AboutSection.module.css';

export function AboutSection({ about, serviceArea }: { about: string; serviceArea: string }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>About</h2>
      <p className={styles.text}>{about}</p>
      <div className={styles.map}>
        <MapPin size={22} className={styles.mapPin} />
        <span className={styles.areaPill}>{serviceArea}</span>
      </div>
    </section>
  );
}
