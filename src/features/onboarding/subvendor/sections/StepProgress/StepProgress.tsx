import styles from './StepProgress.module.css';

export interface StepProgressProps {
  /** 0-based index of the active wizard step (0 = first form step). */
  active: number;
  /** Total form steps. A leading "account done" dot is always shown. */
  total: number;
}

/** 4-dot pager: a completed account dot + one dot per form step. */
export function StepProgress({ active, total }: StepProgressProps) {
  const dots = Array.from({ length: total + 1 });
  return (
    <div className={styles.dots} aria-hidden>
      {dots.map((_, i) => {
        const stepPos = i - 1; // -1 = account (always done)
        const state = stepPos < active ? 'done' : stepPos === active ? 'active' : 'pending';
        return <span key={i} className={`${styles.dot} ${styles[state]}`} />;
      })}
    </div>
  );
}
