import { CheckCircle2 } from 'lucide-react';
import { Button } from '@shared/reusable';
import {
  Stepper,
  BasicInfoForm,
  VerificationForm,
  BankForm,
  ServicesForm,
  PortfolioForm,
} from './sections';
import { SaveIndicator } from './sections/Fields';
import { ONB_COPY } from './constants';
import type { UseOnboardingResult } from './hooks/useOnboarding';
import type { SectionId } from './types';
import styles from './styles.module.css';
import form from './sections/StepForm.module.css';

export interface OnboardingComponentProps {
  onb: UseOnboardingResult;
}

function StepBody({ onb }: { onb: UseOnboardingResult }) {
  switch (onb.currentId) {
    case 'basic':
      return <BasicInfoForm onb={onb} />;
    case 'verification':
      return <VerificationForm onb={onb} />;
    case 'bank':
      return <BankForm onb={onb} />;
    case 'services':
      return <ServicesForm onb={onb} />;
    case 'portfolio':
      return <PortfolioForm onb={onb} />;
    default:
      return null;
  }
}

export function Component({ onb }: OnboardingComponentProps) {
  const current = onb.steps.find((s) => s.id === onb.currentId);
  const order = onb.steps.map((s) => s.id);
  const idx = order.indexOf(onb.currentId);
  const prevId = idx > 0 ? order[idx - 1] : null;
  const nextId = idx < order.length - 1 ? order[idx + 1] : null;
  const saveState = onb.saveState[onb.currentId as SectionId] ?? 'idle';

  return (
    <div className={styles.wrap}>
      <header className={styles.head}>
        <h1 className={styles.title}>{ONB_COPY.title}</h1>
        <p className={styles.subtitle}>{ONB_COPY.subtitle}</p>
      </header>

      <div className={styles.grid}>
        <Stepper steps={onb.steps} onSelect={onb.goToStep} note={ONB_COPY.verifyNote} />
        <section className={styles.panel}>
          {onb.submitted ? (
            <div className={form.success}>
              <span className={form.successTitle}>
                <CheckCircle2 size={22} /> Submitted for verification
              </span>
              <p className={form.sub}>
                Your organizer profile is complete and submitted. Verification is pending — our team
                typically reviews within 24–48 hours, and you&apos;ll be notified once approved.
              </p>
            </div>
          ) : onb.bootstrapping ? (
            <p role="status">Setting up your organizer account…</p>
          ) : onb.bootstrapError ? (
            <div role="alert">
              <p>We couldn&apos;t start your registration. {onb.bootstrapError.message}</p>
              <button type="button" onClick={onb.retryBootstrap}>
                Try again
              </button>
            </div>
          ) : (
            <>
              <div className={form.panelHead}>
                <h2 className={form.panelTitle}>{current?.title ?? 'Step'}</h2>
                <div className={form.panelMeta}>
                  <SaveIndicator state={saveState} />
                  <span className={form.completion}>{onb.profileCompletion}% complete</span>
                </div>
              </div>
              <div className={form.progress}>
                <div
                  className={form.progressFill}
                  style={{ width: `${onb.profileCompletion}%` }}
                />
              </div>

              <StepBody onb={onb} />

              <div className={form.footer}>
                <p className={form.formErr} role={onb.formError ? 'alert' : undefined}>
                  {onb.formError ?? ''}
                </p>
                <div className={form.navBtns}>
                  {prevId && (
                    <Button type="button" variant="secondary" onClick={() => onb.goToStep(prevId)}>
                      Back
                    </Button>
                  )}
                  {nextId ? (
                    <Button type="button" variant="brand" onClick={() => onb.goToStep(nextId)}>
                      Continue
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="brand"
                      isLoading={onb.isSubmitting}
                      onClick={onb.submit}
                    >
                      Submit for verification
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
