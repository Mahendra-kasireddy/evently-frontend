import { Check, Clock } from 'lucide-react';
import { STEP_STATUS_LABEL } from '../../constants';
import type { OnboardingStep } from '../../types';
import styles from './Stepper.module.css';

export interface StepperProps {
  steps: OnboardingStep[];
  onSelect: (id: string) => void;
  note: string;
}

export function Stepper({ steps, onSelect, note }: StepperProps) {
  const total = steps.length;
  const done = steps.filter((s) => s.status === 'completed').length;
  const current = steps.find((s) => s.status === 'current');
  const pct = Math.round((done / total) * 100);

  return (
    <aside className={styles.stepper}>
      <div className={styles.progress}>
        <div className={styles.progressTop}>
          <span>Step {current?.order ?? total} of {total}</span>
          <span className={styles.pct}>{pct}% complete</span>
        </div>
        <div className={styles.bar}>
          <div className={styles.fill} style={{ width: `${pct}%` }} />
        </div>
      </div>
      <ol className={styles.list}>
        {steps.map((s) => (
          <li key={s.id} className={`${styles.step} ${styles[s.status]}`}>
            <button type="button" className={styles.btn} onClick={() => onSelect(s.id)} aria-current={s.status === 'current'}>
              <span className={styles.dot}>{s.status === 'completed' ? <Check size={15} /> : s.order}</span>
              <span className={styles.text}>
                <strong className={styles.stepTitle}>{s.title}</strong>
                <span className={styles.status}>{STEP_STATUS_LABEL[s.status]}</span>
              </span>
            </button>
          </li>
        ))}
      </ol>
      <p className={styles.note}><Clock size={15} /> {note}</p>
    </aside>
  );
}
