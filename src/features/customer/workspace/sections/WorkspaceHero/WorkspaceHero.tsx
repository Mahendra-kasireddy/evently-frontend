import { CalendarPlus, FileText, FilePlus2, MessageSquareQuote } from 'lucide-react';
import styles from './WorkspaceHero.module.css';

export interface WorkspaceHeroProps {
  total: number;
  draftCount: number;
  submittedCount: number;
  quoteCount: number;
  onStartPlan: () => void;
}

export function WorkspaceHero({ total, draftCount, submittedCount, quoteCount, onStartPlan }: WorkspaceHeroProps) {
  const stats = [
    { Icon: FilePlus2, label: 'Drafts', value: draftCount },
    { Icon: FileText, label: 'Submitted', value: submittedCount },
    { Icon: MessageSquareQuote, label: 'Quote requests', value: quoteCount },
  ];

  return (
    <section className={styles.hero}>
      <span className={styles.circle} />
      <div className={styles.head}>
        <span className={styles.eyebrow}>YOUR WORKSPACE</span>
        <h1 className={styles.heading}>
          {total > 0 ? `You're planning ${total} ${total === 1 ? 'event' : 'events'}` : 'Your events live here'}
        </h1>
        <p className={styles.sub}>Track every plan, resume drafts, and follow your quote requests in one place.</p>
      </div>

      <div className={styles.stats}>
        {stats.map((s) => (
          <div key={s.label} className={styles.stat}>
            <span className={styles.statIcon}><s.Icon size={16} /></span>
            <strong className={styles.statValue}>{s.value}</strong>
            <span className={styles.statLabel}>{s.label}</span>
          </div>
        ))}
      </div>

      <button type="button" className={styles.cta} onClick={onStartPlan}>
        <CalendarPlus size={17} /> Plan a new event
      </button>
    </section>
  );
}
