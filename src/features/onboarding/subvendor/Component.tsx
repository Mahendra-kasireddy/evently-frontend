import { AlertCircle, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { StepProgress, DetailsStep, RateStep, LinkStep } from './sections';
import { SUBVENDOR_STEPS } from './constants';
import type { UseSubvendorResult } from './hooks';
import styles from './styles.module.css';

export interface SubvendorComponentProps {
  wizard: UseSubvendorResult;
}

/**
 * The sub-vendor wizard shell.
 *
 * Three things it now does that it did not before, each of which was a real
 * hole rather than a styling gap:
 *
 *  - Back. The hook always exposed `back()`; nothing ever rendered it, so a
 *    typo on step 1 was uncorrectable once you moved on.
 *  - Errors. `finishError` was returned by the hook and thrown away here, so a
 *    failed submission looked exactly like a click that did nothing.
 *  - A readable step count. The progress dots are `aria-hidden`, which left
 *    screen-reader users with no sense of position at all.
 */
export function Component({ wizard }: SubvendorComponentProps) {
  const { step, stepIndex, draft, unit, errors, setField, next, back, finish, isFinishing, finishError } =
    wizard;
  const isLast = step === 'link';
  const isFirst = stepIndex === 0;

  return (
    <div className={styles.card}>
      <div className={styles.panel}>
        {step === 'details' && <DetailsStep draft={draft} errors={errors} setField={setField} />}
        {step === 'rate' && (
          <RateStep draft={draft} unit={unit} errors={errors} setField={setField} />
        )}
        {step === 'link' && <LinkStep draft={draft} errors={errors} setField={setField} />}

        {finishError && (
          <p className={styles.formError} role="alert">
            <AlertCircle size={16} />
            <span>
              <strong>We couldn’t finish your setup.</strong>{' '}
              {finishError.message?.trim()
                ? finishError.message
                : 'Please check your details and try again.'}
            </span>
          </p>
        )}

        <div className={styles.footer}>
          <div className={styles.progress}>
            <StepProgress active={stepIndex} total={SUBVENDOR_STEPS.length} />
            <span className={styles.progressText}>
              Step {stepIndex + 1} of {SUBVENDOR_STEPS.length}
            </span>
          </div>

          <div className={styles.actions}>
            {!isFirst && (
              <button type="button" className={styles.back} onClick={back} disabled={isFinishing}>
                <ChevronLeft size={17} /> Back
              </button>
            )}
            {isLast ? (
              <button
                type="button"
                className={styles.cta}
                onClick={finish}
                disabled={isFinishing}
              >
                <Check size={17} /> {isFinishing ? 'Finishing…' : 'Finish setup'}
              </button>
            ) : (
              <button type="button" className={styles.cta} onClick={next}>
                Save &amp; continue <ChevronRight size={17} />
              </button>
            )}
          </div>
        </div>
      </div>

      {isLast && (
        <p className={styles.helper}>
          You’ll receive task assignments from your organizer in this app.
        </p>
      )}
    </div>
  );
}
