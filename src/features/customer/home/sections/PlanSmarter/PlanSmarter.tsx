import { Wallet, Users, ListChecks, Bell, type LucideIcon } from 'lucide-react';
import type { ToolsSection, ToolIcon } from '../../types';
import styles from './PlanSmarter.module.css';

const ICONS: Record<ToolIcon, LucideIcon> = { wallet: Wallet, users: Users, list: ListChecks, bell: Bell };

export interface PlanSmarterProps {
  data: ToolsSection;
}

export function PlanSmarter({ data }: PlanSmarterProps) {
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{data.title}</h2>
      <p className={styles.subtitle}>{data.subtitle}</p>
      <div className={styles.grid}>
        {data.tools.map((t) => {
          const Icon = ICONS[t.icon] ?? Wallet;
          return (
            <article key={t.id} className={styles.card}>
              <span className={styles.icon}><Icon size={20} /></span>
              <h3 className={styles.cardTitle}>{t.title}</h3>
              <p className={styles.cardDesc}>{t.description}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
