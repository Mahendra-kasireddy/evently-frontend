import { Link } from 'react-router-dom';
import { CalendarDays, MapPin, Users, Clock, Check, ChevronRight } from 'lucide-react';
import { formatINR } from '@features/customer/quotes/transform';
import {
  MILESTONES,
  STAGE_LABEL,
  STAGE_TONE,
  type WorkspaceEvent,
} from '../../event-model';
import styles from './EventCard.module.css';

export interface EventCardProps {
  event: WorkspaceEvent;
}

/**
 * One card per event, whatever stage it is at.
 *
 * My Events previously had three card designs — one for plans, one for quote
 * requests, one for bookings — each with its own status vocabulary and its own
 * idea of what the primary action was. The same event moving from one stage to
 * the next appeared to become a different kind of thing. This is the single
 * card it keeps for its whole life: the milestone rail advances, the status
 * line and the action change, the card does not.
 */
export function EventCard({ event }: EventCardProps) {
  const tone = STAGE_TONE[event.stage];
  const showRail = !event.past;

  return (
    <article className={`${styles.card} ${event.needsYou ? styles.cardAttention : ''} ${event.past ? styles.cardPast : ''}`}>
      <div className={styles.head}>
        <span className={styles.avatar} style={{ backgroundColor: event.organizerColor }} aria-hidden>
          {event.organizerInitials}
        </span>

        <div className={styles.headText}>
          <h3 className={styles.title}>{event.title}</h3>
          <p className={styles.sub}>
            {event.organizerName ?? 'No organizer yet'}
            {event.reference ? ` · ${event.reference}` : ''}
          </p>
        </div>

        <span className={`${styles.chip} ${styles[tone]}`}>{STAGE_LABEL[event.stage]}</span>
      </div>

      {/* The one line that says what is happening and whose move it is. */}
      <p className={`${styles.status} ${event.needsYou ? styles.statusAttention : ''}`}>
        {event.statusLine}
      </p>

      {showRail && (
        <ol className={styles.rail} aria-label="Event progress">
          {MILESTONES.map((label, i) => {
            const done = i < event.milestone;
            const current = i === event.milestone;
            return (
              <li
                key={label}
                className={`${styles.step} ${done ? styles.stepDone : ''} ${current ? styles.stepCurrent : ''}`}
              >
                <span className={styles.dot}>{done && <Check size={10} strokeWidth={3} />}</span>
                <span className={styles.stepLabel}>{label}</span>
              </li>
            );
          })}
        </ol>
      )}

      <div className={styles.facts}>
        {event.when && (
          <span className={styles.fact}>
            <CalendarDays size={13} /> {event.when}
          </span>
        )}
        {event.where && (
          <span className={styles.fact}>
            <MapPin size={13} /> {event.where}
          </span>
        )}
        {event.guests && (
          <span className={styles.fact}>
            <Users size={13} /> {event.guests} guests
          </span>
        )}
        {typeof event.daysToGo === 'number' && event.daysToGo >= 0 && !event.past && (
          <span className={styles.countdown}>
            <Clock size={13} />
            {event.daysToGo === 0
              ? 'Today'
              : event.daysToGo === 1
                ? 'Tomorrow'
                : `${event.daysToGo} days to go`}
          </span>
        )}
      </div>

      <div className={styles.foot}>
        {event.amount !== null && (
          <span className={styles.amount}>
            {event.booking ? formatINR(event.amount) : `from ${formatINR(event.amount)}`}
          </span>
        )}
        <span className={styles.actions}>
          {event.secondary && (
            <Link to={event.secondary.to} className={styles.secondary}>
              {event.secondary.label}
            </Link>
          )}
          <Link to={event.primary.to} className={styles.primary}>
            {event.primary.label} <ChevronRight size={15} />
          </Link>
        </span>
      </div>
    </article>
  );
}

export default EventCard;
