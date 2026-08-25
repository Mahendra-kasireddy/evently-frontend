import { AlertTriangle, Check, CheckCircle2, ChevronRight, Clock, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Btn } from '@shared/partner';
import {
  Stepper,
  BasicInfoForm,
  VerificationForm,
  BankForm,
  ServicesForm,
  PortfolioForm,
} from './sections';
import { SaveIndicator } from './sections/Fields';
import { ONB_COPY, STEP_HEADINGS } from './constants';
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

/**
 * What the organizer sees while an admin gate is closed.
 *
 * The backend refuses onboarding writes in these states, so rendering the
 * wizard would only produce 403s on every autosave. Navigating straight to
 * this URL lands here too — the state comes from the API, not the router.
 */
function ReviewGate({ onb }: OnboardingComponentProps) {
  const navigate = useNavigate();

  if (onb.status === 'pending_review') {
    return (
      <div className={form.success}>
        <span className={form.successTitle}>
          <Clock size={22} /> Registration received
        </span>
        <p className={form.sub}>
          Thanks for registering. Our team is reviewing your registration — you&apos;ll be able to
          complete your onboarding as soon as it&apos;s approved. We&apos;ll notify you on this
          number.
        </p>
      </div>
    );
  }

  if (onb.status === 'rejected') {
    return (
      <div className={form.success} role="alert">
        <span className={form.successTitle}>
          <XCircle size={22} /> Registration not approved
        </span>
        <p className={form.sub}>
          {onb.reviewNote
            ? onb.reviewNote
            : 'Your organizer registration was not approved. Contact Evently support if you think this is a mistake.'}
        </p>
      </div>
    );
  }

  // submitted — waiting on the second gate
  return (
    <div className={form.success}>
      <span className={form.successTitle}>
        <CheckCircle2 size={22} /> Profile submitted for review
      </span>
      <p className={form.sub}>
        Your profile is complete and with our team. Once it&apos;s approved it becomes visible to
        customers looking for organizers, and you can start receiving quote requests.
      </p>
      <Btn kind="outline" onClick={() => navigate('/organizer/home')}>
        Go to your dashboard
      </Btn>
    </div>
  );
}

export function Component({ onb }: OnboardingComponentProps) {
  const current = onb.steps.find((s) => s.id === onb.currentId);
  const order = onb.steps.map((s) => s.id);
  const idx = order.indexOf(onb.currentId);
  const prevId = idx > 0 ? order[idx - 1] : null;
  const nextId = idx < order.length - 1 ? order[idx + 1] : null;
  const saveState = onb.saveState[onb.currentId as SectionId] ?? 'idle';
  const head = STEP_HEADINGS[onb.currentId];

  return (
    <div className={styles.wrap}>
      <Stepper
        steps={onb.steps}
        onSelect={onb.goToStep}
        note={ONB_COPY.verifyNote}
        currentId={onb.currentId}
      />

      <section className={styles.panel}>
        {onb.bootstrapping ? (
          <p className={form.state} role="status">
            Setting up your organizer account…
          </p>
        ) : onb.bootstrapError ? (
          <div role="alert">
            <p className={form.state}>
              We couldn&apos;t start your registration. {onb.bootstrapError.message}
            </p>
            <Btn kind="outline" sm onClick={onb.retryBootstrap}>
              Try again
            </Btn>
          </div>
        ) : !onb.canEdit ? (
          <ReviewGate onb={onb} />
        ) : (
          <>
            {onb.status === 'changes_requested' && (
              <div className={form.reviewBanner} role="alert">
                <AlertTriangle size={16} />
                <span>
                  <strong>Changes requested.</strong>{' '}
                  {onb.reviewNote || 'Please update your details and submit again.'}
                </span>
              </div>
            )}
            <div className={form.panelHead}>
              <div>
                <h1 className={form.panelTitle}>{head?.heading ?? current?.title ?? 'Step'}</h1>
                {head?.blurb && <p className={form.panelBlurb}>{head.blurb}</p>}
              </div>
              <div className={form.panelMeta}>
                <span className={form.completion}>{onb.profileCompletion}% complete</span>
                <SaveIndicator state={saveState} />
              </div>
            </div>
            <div className={form.progress}>
              <div className={form.progressFill} style={{ width: `${onb.profileCompletion}%` }} />
            </div>

            <div className={styles.body}>
              <StepBody onb={onb} />
            </div>

            <div className={form.footer}>
              {prevId && (
                <Btn kind="outline" sm onClick={() => onb.goToStep(prevId)}>
                  Back
                </Btn>
              )}
              <p className={form.formErr} role={onb.formError ? 'alert' : undefined}>
                {onb.formError ?? ''}
              </p>
              <span className={form.spacer} />
              {nextId ? (
                <Btn sm icon={<ChevronRight size={14} />} onClick={() => onb.goToStep(nextId)}>
                  Save &amp; Continue
                </Btn>
              ) : (
                <Btn sm icon={<Check size={14} />} disabled={onb.isSubmitting} onClick={onb.submit}>
                  {onb.isSubmitting ? 'Submitting…' : 'Submit for review'}
                </Btn>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
