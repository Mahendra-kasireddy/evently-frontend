import { Check } from 'lucide-react';
import { ONB_COPY, STEP_STATUS_LABEL } from '../../constants';
import type { OnboardingStep } from '../../types';
import styles from './Stepper.module.css';

export interface StepperProps {
  steps: OnboardingStep[];
  onSelect: (id: string) => void;
  note: string;
  /** Which step the panel is showing — a revisited step is 'completed', not 'current'. */
  currentId?: string | undefined;
}

/** Left rail: "Step n of 5", the numbered step list and the verification note. */
export function Stepper({ steps, onSelect, note, currentId }: StepperProps) {
  const total = steps.length;
  const current = steps.find((s) => s.id === currentId) ?? steps.find((s) => s.status === 'current');

  return (
    <aside className={styles.stepper}>
      <div className={styles.title}>{ONB_COPY.title}</div>
      <div className={styles.stepOf}>
        Step {current?.order ?? total} of {total}
      </div>
      <ol className={styles.list}>
        {steps.map((s) => (
          <li
            key={s.id}
            className={`${styles.step} ${styles[s.status]} ${s.id === currentId ? styles.active : ''}`}
          >
            <button
              type="button"
              className={styles.btn}
              onClick={() => onSelect(s.id)}
              aria-current={s.status === 'current' ? 'step' : undefined}
            >
              <span className={styles.dot}>
                {s.status === 'completed' ? <Check size={14} /> : s.order}
              </span>
              <span className={styles.text}>
                <span className={styles.stepTitle}>{s.title}</span>
                <span className={styles.status}>{STEP_STATUS_LABEL[s.status]}</span>
              </span>
            </button>
          </li>
        ))}
      </ol>
      <p className={styles.note}>{note}</p>
    </aside>
  );
}
