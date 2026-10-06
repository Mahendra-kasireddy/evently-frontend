import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Circle, Clock, Landmark, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { NormalizedApiError } from '@lib/api';
import { Btn, BtnLink, Card } from '@shared/partner';
import {
  useCompleteOrganizerOnboardingMutation,
  useGetOrganizerOnboardingStatusQuery,
} from '@features/onboarding/organizer/service';
import type { OnboardingStatusView } from '@features/onboarding/organizer/types';
import { GO_LIVE_COPY as COPY } from '../constants';
import styles from './GoLiveCard.module.css';

/** The checklist's own page, inside the dashboard shell. */
const SETUP_PATH = '/organizer/setup';
const stepLink = (id: string) => `${SETUP_PATH}?step=${id}`;

/**
 * The go-live checklist, at the top of the dashboard until the organizer is
 * verified.
 *
 * Sign-up asks for the basics only and opens the dashboard straight away, so
 * this card is where the rest happens: each step, what it is missing, and —
 * once everything needed to go live is in — the button that sends the
 * profile for verification. Bank details sit apart: they are needed before
 * the first payout, not before going live, and stay here as a reminder after
 * approval until they are on file.
 */
export function GoLiveCard() {
  const { data, isLoading, isError } = useGetOrganizerOnboardingStatusQuery();
  const [submit, submitState] = useCompleteOrganizerOnboardingMutation();

  if (isLoading || isError || !data) return null;
  const status = data.onboardingStatus;
  const bank = data.steps.find((s) => s.id === 'bank');

  if (status === 'approved') {
    if (data.payoutReady || !data.canEditBank) return null;
    return <PayoutReminder />;
  }

  if (status === 'submitted') {
    return (
      <Card padding="20px" className={styles.card}>
        <Header icon={<Clock size={18} />} tone="amber" title={COPY.submittedTitle} body={COPY.submittedBody} />
        {!data.payoutReady && data.canEditBank && <PayoutRow />}
      </Card>
    );
  }

  if (status === 'rejected') {
    return (
      <Card padding="20px" className={styles.card}>
        <Header
          icon={<XCircle size={18} />}
          tone="red"
          title={COPY.rejectedTitle}
          body={data.reviewNote || COPY.rejectedBody}
        />
      </Card>
    );
  }

  // draft / in_progress / changes_requested — the checklist itself. A
  // profile still at the retired registration gate gets it too: opening the
  // setup page lets it in (see the backend's register).
  const goLiveSteps = data.steps.filter((s) => s.requiredForGoLive);
  const done = goLiveSteps.filter((s) => s.complete).length;
  const percent = Math.round((done / Math.max(1, goLiveSteps.length)) * 100);
  const next = goLiveSteps.find((s) => !s.complete);
  const changes = status === 'changes_requested';
  const error = submitState.error as NormalizedApiError | undefined;

  return (
    <Card padding="20px" className={styles.card}>
      <Header
        icon={changes ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
        tone={changes ? 'amber' : 'coral'}
        title={changes ? COPY.changesTitle : COPY.setupTitle}
        body={changes ? data.reviewNote || COPY.changesBody : COPY.setupBody}
      />

      <div className={styles.progressRow}>
        <div className={styles.track}>
          <div className={styles.fill} style={{ width: `${percent}%` }} />
        </div>
        <span className={styles.progressLabel}>{COPY.progress(done, goLiveSteps.length)}</span>
      </div>

      <ul className={styles.list}>
        {goLiveSteps.map((s) => (
          <StepRow key={s.id} step={s} />
        ))}
        {bank && <StepRow step={bank} optionalNote={COPY.bankNote} />}
      </ul>

      <div className={styles.actions}>
        {data.canSubmit ? (
          <Btn sm disabled={submitState.isLoading} onClick={() => void submit()}>
            {submitState.isLoading ? COPY.submitting : COPY.submit}
          </Btn>
        ) : (
          next && (
            <BtnLink sm to={stepLink(next.id)}>
              {done === 0 ? COPY.start : COPY.continue}
            </BtnLink>
          )
        )}
        <span className={styles.hint}>{COPY.verifyNote}</span>
      </div>
      {error && (
        <p className={styles.error} role="alert">
          {error.message}
        </p>
      )}
    </Card>
  );
}

function Header({
  icon,
  tone,
  title,
  body,
}: {
  icon: ReactNode;
  tone: 'coral' | 'amber' | 'red';
  title: string;
  body: string;
}) {
  return (
    <div className={styles.head}>
      <span className={`${styles.badge} ${styles[tone]}`}>{icon}</span>
      <div>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.body}>{body}</p>
      </div>
    </div>
  );
}

function StepRow({
  step,
  optionalNote,
}: {
  step: OnboardingStatusView['steps'][number];
  optionalNote?: string;
}) {
  return (
    <li className={styles.row}>
      {step.complete ? (
        <CheckCircle2 size={18} className={styles.done} />
      ) : (
        <Circle size={18} className={styles.todo} />
      )}
      <div className={styles.rowText}>
        <span className={styles.rowTitle}>{step.title}</span>
        {!step.complete && (
          <span className={styles.rowMeta}>
            {optionalNote ?? COPY.missing(step.missingFields)}
          </span>
        )}
      </div>
      {!step.complete && (
        <Link to={stepLink(step.id)} className={styles.rowLink}>
          {COPY.fill}
        </Link>
      )}
    </li>
  );
}

function PayoutRow() {
  return (
    <div className={styles.payout}>
      <Landmark size={16} />
      <span>{COPY.payoutBody}</span>
      <Link to={stepLink('bank')} className={styles.rowLink}>
        {COPY.payoutCta}
      </Link>
    </div>
  );
}

function PayoutReminder() {
  return (
    <Card padding="16px 20px" className={styles.card}>
      <PayoutRow />
    </Card>
  );
}

export default GoLiveCard;
