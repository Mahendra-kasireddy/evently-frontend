import { SquarePen, FileText, BarChart3, ShieldCheck, type LucideIcon } from 'lucide-react';
import type { HowItWorks as HowItWorksData, HowIcon } from '../../types';
import styles from './HowItWorks.module.css';

const ICONS: Record<HowIcon, LucideIcon> = {
  edit: SquarePen, file: FileText, chart: BarChart3, shield: ShieldCheck,
};

export interface HowItWorksProps {
  data: HowItWorksData;
}

export function HowItWorks({ data }: HowItWorksProps) {
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{data.title}</h2>
      <p className={styles.subtitle}>{data.subtitle}</p>
      <div className={styles.grid}>
        {data.steps.map((s) => {
          const Icon = ICONS[s.icon] ?? SquarePen;
          return (
            <article key={s.num} className={styles.card}>
              <div className={styles.top}>
                <span className={styles.icon}><Icon size={20} /></span>
                <span className={styles.num}>{s.num}</span>
              </div>
              <h3 className={styles.cardTitle}>{s.title}</h3>
              <p className={styles.cardDesc}>{s.description}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
