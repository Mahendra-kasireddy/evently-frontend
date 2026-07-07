import { Check } from 'lucide-react';
import type { PlanStep } from '../../types';
import styles from './Stepper.module.css';

export interface StepperProps {
  steps: PlanStep[];
  current: number;
  onSelect: (index: number) => void;
}

export function Stepper({ steps, current, onSelect }: StepperProps) {
  return (
    <div className={styles.stepper}>
      {steps.map((s, i) => {
        const state = i < current ? 'done' : i === current ? 'current' : 'pending';
        return (
          <div key={s.id} className={styles.item}>
            <button type="button" className={styles.step} onClick={() => onSelect(i)}>
              <span className={`${styles.dot} ${styles[state]}`}>{state === 'done' ? <Check size={13} strokeWidth={3} /> : i + 1}</span>
              <span className={`${styles.label} ${i === current ? styles.labelOn : ''}`}>{s.label}</span>
            </button>
            {i < steps.length - 1 && <span className={`${styles.line} ${i < current ? styles.lineOn : ''}`} />}
          </div>
        );
      })}
    </div>
  );
}
