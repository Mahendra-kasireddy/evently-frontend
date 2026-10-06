import { useEffect } from 'react';
import { Check } from 'lucide-react';
import { SetupPanel } from '@features/onboarding/organizer/Component';
import { GO_LIVE_STEP_IDS } from '@features/onboarding/organizer/constants';
import type { UseOnboardingResult } from '@features/onboarding/organizer/hooks/useOnboarding';
import { SETUP_COPY } from './constants';
import styles from './styles.module.css';

/**
 * The go-live checklist, one step at a time, inside the organizer shell —
 * the dashboard's top bar (with its back arrow) above, its tabs below.
 *
 * A compact strip of the steps rather than the sign-up wizard's tracker
 * card: on a phone that card took the whole first screen before a single
 * field appeared.
 */
export function Component({ onb }: { onb: UseOnboardingResult }) {
  // A new step starts at its top, not wherever the last one was scrolled to.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [onb.currentId]);

  return (
    <div className={styles.wrap}>
      <nav className={styles.strip} aria-label={SETUP_COPY.stepsLabel}>
        {onb.steps.map((step) => {
          const current = step.id === onb.currentId;
          const done = step.status === 'completed';
          const optional = !GO_LIVE_STEP_IDS.includes(step.id);
          return (
            <button
              key={step.id}
              type="button"
              className={`${styles.pill} ${current ? styles.pillCurrent : ''} ${done ? styles.pillDone : ''}`}
              aria-current={current ? 'step' : undefined}
              onClick={() => onb.goToStep(step.id)}
            >
              <span className={styles.mark}>{done ? <Check size={12} strokeWidth={3} /> : step.order}</span>
              <span className={styles.pillText}>
                {step.title}
                {optional && <span className={styles.optional}>{SETUP_COPY.optional}</span>}
              </span>
            </button>
          );
        })}
      </nav>

      <SetupPanel onb={onb} />
    </div>
  );
}
