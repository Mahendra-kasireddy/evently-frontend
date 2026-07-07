import { ChevronLeft } from 'lucide-react';
import styles from './QuotesHero.module.css';

export function QuotesHero({ eyebrow, heading, subtitle, onBack }: { eyebrow: string; heading: string; subtitle: string; onBack: () => void }) {
  return (
    <section className={styles.hero}>
      <span className={styles.circle} aria-hidden /><span className={styles.circle2} aria-hidden />
      <button type="button" className={styles.back} onClick={onBack} aria-label="Back"><ChevronLeft size={18} /></button>
      <div className={styles.content}>
        <span className={styles.eyebrow}>{eyebrow}</span>
        <h1 className={styles.heading}>{heading}</h1>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>
    </section>
  );
}
