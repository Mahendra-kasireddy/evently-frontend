import { ShieldCheck, Star, Zap } from 'lucide-react';
import styles from './DiscoverHero.module.css';

export function DiscoverHero({ eyebrow, heading, subtitle }: { eyebrow: string; heading: string; subtitle: string }) {
  return (
    <section className={styles.hero}>
      <span className={styles.glow} aria-hidden />
      <span className={styles.eyebrow}>{eyebrow}</span>
      <h1 className={styles.heading}>{heading}</h1>
      <p className={styles.subtitle}>{subtitle}</p>
      <div className={styles.trust}>
        <span><ShieldCheck size={15} /> Verified & certified</span>
        <span><Star size={15} /> Rated by real families</span>
        <span><Zap size={15} /> Quotes in a day</span>
      </div>
    </section>
  );
}
