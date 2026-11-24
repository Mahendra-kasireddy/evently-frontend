import type { ReactNode } from 'react';
import { AlertTriangle, ChevronRight, Clock, Landmark, Rocket, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '@shared/partner';
import { useGetOrganizerOnboardingStatusQuery } from '@features/onboarding/organizer/service';
import { GO_LIVE_COPY as COPY } from '../constants';
import styles from './GoLiveCard.module.css';

/** The checklist's own page, inside the dashboard shell. */
const SETUP_PATH = '/organizer/setup';
const stepLink = (id: string) => `${SETUP_PATH}?step=${id}`;

/**
 * The go-live progress, at the top of the dashboard until the organizer is
 * verified.
 *
 * Sign-up asks for the basics only and opens the dashboard straight away.
 * This card is just the summary — how far along they are and what is next —
 * and the whole card opens the setup page, where the steps and the submit
 * button are. Bank details sit apart: they are needed before
 * the first payout, not before going live, and stay here as a reminder after
 * approval until they are on file.
 */
export function GoLiveCard() {
  const { data, isLoading, isError } = useGetOrganizerOnboardingStatusQuery();

  if (isLoading || isError || !data) return null;
  const status = data.onboardingStatus;

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

  // draft / in_progress / changes_requested — one card: where they are and a
  // way in. The steps themselves, and submitting, live on the setup page. A
  // profile still at the retired registration gate gets it too: opening the
  // setup page lets it in (see the backend's register).
  const goLiveSteps = data.steps.filter((s) => s.requiredForGoLive);
  const done = goLiveSteps.filter((s) => s.complete).length;
  const percent = Math.round((done / Math.max(1, goLiveSteps.length)) * 100);
  const next = goLiveSteps.find((s) => !s.complete);
  const changes = status === 'changes_requested';

  return (
    <Link
      to={next ? stepLink(next.id) : SETUP_PATH}
      className={styles.cardLink}
      aria-label={`${changes ? COPY.changesTitle : COPY.setupTitle} — ${COPY.progress(done, goLiveSteps.length)}`}
    >
      <Card padding="20px" className={styles.card}>
        <Header
          icon={changes ? <AlertTriangle size={18} /> : <Rocket size={18} />}
          tone={changes ? 'amber' : 'coral'}
          title={changes ? COPY.changesTitle : COPY.setupTitle}
          body={changes ? data.reviewNote || COPY.changesBody : COPY.setupBody}
          trailing={<ChevronRight size={20} className={styles.chevron} />}
        />

        <div className={styles.progressRow}>
          <div className={styles.track}>
            <div className={styles.fill} style={{ width: `${percent}%` }} />
          </div>
          <span className={styles.progressLabel}>{percent}%</span>
        </div>

        <div className={styles.footer}>
          <span className={styles.count}>{COPY.progress(done, goLiveSteps.length)}</span>
          <span className={styles.next}>
            {data.canSubmit ? COPY.readyToSubmit : next ? COPY.nextStep(next.title) : ''}
          </span>
        </div>
      </Card>
    </Link>
  );
}

function Header({
  icon,
  tone,
  title,
  body,
  trailing,
}: {
  icon: ReactNode;
  tone: 'coral' | 'amber' | 'red';
  title: string;
  body: string;
  trailing?: ReactNode;
}) {
  return (
    <div className={styles.head}>
      <span className={`${styles.badge} ${styles[tone]}`}>{icon}</span>
      <div className={styles.headText}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.body}>{body}</p>
      </div>
      {trailing}
    </div>
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
