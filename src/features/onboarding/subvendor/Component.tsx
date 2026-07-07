import { ChevronRight, Check } from 'lucide-react';
import { Button } from '@shared/reusable';
import { StepProgress, DetailsStep, RateStep, LinkStep } from './sections';
import { SUBVENDOR_STEPS } from './constants';
import type { UseSubvendorResult } from './hooks';
import styles from './styles.module.css';

export interface SubvendorComponentProps {
  wizard: UseSubvendorResult;
}

/** Single-column sub-vendor onboarding wizard (3 steps + account dot). Pure. */
export function Component({ wizard }: SubvendorComponentProps) {
  const { step, stepIndex, draft, unit, setField, next, finish, isFinishing } = wizard;
  const isLast = step === 'link';

  return (
    <div className={styles.card}>
      {step === 'details' && <DetailsStep draft={draft} setField={setField} />}
      {step === 'rate' && <RateStep draft={draft} unit={unit} setField={setField} />}
      {step === 'link' && <LinkStep draft={draft} setField={setField} />}

      <div className={styles.footer}>
        <StepProgress active={stepIndex} total={SUBVENDOR_STEPS.length} />
        {isLast ? (
          <Button variant="brand" size="lg" className={styles.cta} isLoading={isFinishing} onClick={finish}>
            <Check size={18} /> Finish setup
          </Button>
        ) : (
          <Button variant="brand" size="lg" className={styles.cta} onClick={next}>
            <ChevronRight size={18} /> Save &amp; Continue
          </Button>
        )}
      </div>

      {isLast && (
        <p className={styles.helper}>
          You&rsquo;ll receive task assignments from your organizer via this app and WhatsApp.
        </p>
      )}
    </div>
  );
}
