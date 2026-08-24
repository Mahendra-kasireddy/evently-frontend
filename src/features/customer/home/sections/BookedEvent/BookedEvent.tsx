import { Check, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { bookedWorkspaceRoute, MY_EVENTS_ROUTE } from '@features/customer/workspace/routes';
import type { BookedEventData } from '../../types';
import styles from './BookedEvent.module.css';

/** Ring geometry, matching the reference: 92px ring inside a 104px wash disc. */
const RING_SIZE = 92;
const RING_STROKE = 10;
const RING_RADIUS = (RING_SIZE - RING_STROKE - 2) / 2;
const RING_CIRC = 2 * Math.PI * RING_RADIUS;

/*
 * A pending booking still reads "BOOKED": the customer has chosen an organizer
 * and paid, so from their side the event *is* booked — what is outstanding is
 * the organizer's confirmation, which the description states outright rather
 * than hiding behind a vaguer badge.
 */
const STATUS_LABEL: Record<BookedEventData['status'], string> = {
  pending: 'BOOKED',
  confirmed: 'BOOKED',
  in_progress: 'IN PROGRESS',
};

/**
 * Home's ongoing-booking card — the one place on the discovery page that turns
 * into a live event summary once the customer actually has a booking.
 *
 * The whole card is the action (it opens the workspace), so the "Open workspace"
 * pill is presentational rather than a nested <button>: one focusable control,
 * one accessible name, and the same tap target the design implies.
 *
 * Rendered only when the backend returns an ongoing booking — see
 * `safeBookedEvent` for the data hardening, and Component.tsx for the rule that
 * makes this card and the compact CurrentEvent widget mutually exclusive.
 */
export function BookedEvent({ data }: { data?: BookedEventData | undefined }) {
  const navigate = useNavigate();
  if (!data) return null;

  /*
   * "Open workspace" opens *this* event's workspace, not the My Events hub — the
   * card names one booking, so landing on a list was a step backwards. Falls back
   * to the hub only if the payload somehow carries no id.
   */
  const open = () => navigate(data.id ? bookedWorkspaceRoute(data.id) : MY_EVENTS_ROUTE);
  const offset = RING_CIRC * (1 - data.progress / 100);

  return (
    <section
      className={styles.card}
      role="button"
      tabIndex={0}
      aria-label={`${data.title} — ${data.progress}% ready, ${data.daysToGo} days to go. Open workspace.`}
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open();
        }
      }}
    >
      <span className={styles.accent} aria-hidden="true" />

      <div className={styles.ringWrap}>
        <svg
          width={RING_SIZE}
          height={RING_SIZE}
          viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
          className={styles.ringSvg}
          aria-hidden="true"
        >
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            className={styles.ringTrack}
            strokeWidth={RING_STROKE}
          />
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            className={styles.ringFill}
            strokeWidth={RING_STROKE}
            strokeDasharray={RING_CIRC}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
          />
        </svg>
        <span className={styles.ringText} aria-hidden="true">
          <strong>{data.progress}%</strong>
          <small>ready</small>
        </span>
      </div>

      <div className={styles.body}>
        <span className={styles.ref}>
          {STATUS_LABEL[data.status]} · {data.ref}
        </span>
        <h2 className={styles.title}>{data.title}</h2>
        {data.description && <p className={styles.desc}>{data.description}</p>}

        {data.steps.length > 0 && (
          <ul className={styles.steps}>
            {data.steps.map((s) => (
              <li
                key={s.label}
                className={`${styles.step} ${s.done ? styles.done : ''}`}
                aria-label={`${s.label}: ${s.done ? 'done' : 'not yet'}`}
              >
                <span className={styles.stepDot} aria-hidden="true">
                  {s.done && <Check size={10} strokeWidth={3} />}
                </span>
                {s.label}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={styles.aside}>
        <div className={styles.days}>
          <strong>{data.daysToGo}</strong>
          <small>{data.daysToGo === 1 ? 'day to go' : 'days to go'}</small>
        </div>
        <span className={styles.cta} aria-hidden="true">
          <ChevronRight size={16} strokeWidth={2.4} /> Open workspace
        </span>
      </div>
    </section>
  );
}
