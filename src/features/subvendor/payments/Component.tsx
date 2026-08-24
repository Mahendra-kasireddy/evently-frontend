import { formatINR, dateLabel } from '@features/subvendor/tasks/transform';
import type { OrganizerRef, SubVendorPerformance } from './types';
import styles from './styles.module.css';

export interface PaymentsComponentProps {
  performance: SubVendorPerformance;
  organizers: OrganizerRef[];
}

const STATUS_LABEL: Record<string, string> = { pending: 'Pending', processing: 'Processing', paid: 'Paid' };

function ScoreRing({ score }: { score: number }) {
  const r = 54;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  return (
    <svg width={140} height={140} viewBox="0 0 140 140" className={styles.ring}>
      <circle cx={70} cy={70} r={r} fill="none" stroke="var(--color-border)" strokeWidth={12} />
      <circle
        cx={70}
        cy={70}
        r={r}
        fill="none"
        stroke="#1d9e75"
        strokeWidth={12}
        strokeDasharray={c}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 70 70)"
      />
      <text x={70} y={76} textAnchor="middle" className={styles.ringText}>
        {score}%
      </text>
    </svg>
  );
}

function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div className={styles.barRow}>
      <span className={styles.barLabel}>{label}</span>
      <div className={styles.barTrack}>
        <div className={styles.barFill} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
      <span className={styles.barValue}>{value}%</span>
    </div>
  );
}

export function Component({ performance, organizers }: PaymentsComponentProps) {
  const { scoreBreakdown: sb } = performance;
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Payments</h1>

        <div className={styles.top}>
          <section className={styles.scoreCard}>
            <span className={styles.scoreLabel}>Performance score</span>
            <ScoreRing score={performance.performanceScore} />
          </section>

          <div className={styles.stats}>
            <div className={styles.stat}>
              <strong>{formatINR(performance.thisMonthEarned)}</strong>
              <small>This month earned</small>
            </div>
            <div className={styles.stat}>
              <strong>{formatINR(performance.pendingPayout)}</strong>
              <small>Pending payout</small>
            </div>
            <div className={styles.stat}>
              <strong>{formatINR(performance.lifetimeEarned)}</strong>
              <small>Lifetime earned</small>
            </div>
          </div>
        </div>

        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Score breakdown</h2>
          <Bar label="On-time delivery rate" value={sb.onTimeDeliveryRate} />
          <Bar label="Task completion rate" value={sb.taskCompletionRate} />
          <Bar label="Photo proof submission" value={sb.photoProofSubmissionRate} />
          <Bar label="Avg organizer rating" value={sb.avgOrganizerRating} />
        </section>

        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Payments</h2>
          {performance.payments.length ? (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Organizer</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {performance.payments.map((p) => (
                    <tr key={p.taskId}>
                      <td>{p.event}</td>
                      <td>{p.organizerName}</td>
                      <td>{formatINR(p.amount)}</td>
                      <td>
                        <span className={`${styles.badge} ${styles[p.status]}`}>{STATUS_LABEL[p.status]}</span>
                      </td>
                      <td>{dateLabel(p.eventDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className={styles.empty}>No paid tasks yet.</p>
          )}
        </section>

        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>My organizers</h2>
          {organizers.length ? (
            <div className={styles.orgList}>
              {organizers.map((o) => (
                <span key={o.id} className={styles.orgChip}>{o.name}</span>
              ))}
            </div>
          ) : (
            <p className={styles.empty}>Not linked to any organizer yet.</p>
          )}
        </section>
      </div>
    </main>
  );
}
