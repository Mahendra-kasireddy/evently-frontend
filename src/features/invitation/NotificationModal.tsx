import { BellRing, CalendarDays, Clock, MapPin, PlayCircle } from 'lucide-react';
import { Lightbox } from './Lightbox';
import { LiveBadge } from './LiveStream';
import { directionsUrl } from './directions';
import { LIVE_COPY as LIVE, NOTIFICATION_COPY as COPY } from './constants';
import { Rings } from './Ornaments';
import { dateInZone, timeInZone } from './countdown';
import type { GuestCountdown, GuestNotification } from './types';
import styles from './NotificationModal.module.css';

export interface NotificationModalProps {
  open: boolean;
  notification: GuestNotification;
  countdown: GuestCountdown;
  onDismiss: () => void;
  /**
   * Take the guest to the stream. Supplied only when there is one, which is
   * also what tells this card to draw its live face.
   */
  onWatch?: (() => void) | undefined;
}

/**
 * The day-before notice.
 *
 * What a guest needs the night before a wedding and nothing else: a greeting,
 * a word from the couple, which event, when, where, and the way there. One
 * dismissal, worded as the thing it means — a row of Close / Later / Remind me
 * would be asking the guest to make a decision they do not have.
 *
 * Whether it appears at all, and which wording it carries, was decided by the
 * server; this only draws it.
 */
export function NotificationModal({
  open,
  notification,
  countdown,
  onDismiss,
  onWatch,
}: NotificationModalProps) {
  if (!notification.show) return null;

  /*
   * The same card, in its live state.
   *
   * One component and not two: it is the same paper, the same dismissal and
   * the same "this is what is happening, here is what to do about it" — the
   * only differences are the badge, the headline and a second button. A
   * separate modal would be that agreement, copied, waiting to drift.
   */
  if (notification.state === 'live') {
    return (
      <Lightbox
        open={open}
        onClose={onDismiss}
        label={LIVE.dismiss}
        closeTone="onLight"
      >
        <div className={styles.card}>
          <span className={styles.rings}>
            <Rings color="#b0852b" />
          </span>
          <LiveBadge label={LIVE.liveNow} />

          <h2 className={styles.title}>{notification.name || countdown.name}</h2>
          <p className={styles.happening}>{LIVE.happeningNow}</p>
          <p className={styles.message}>{notification.message}</p>

          <div className={styles.actions}>
            {/* Offered only when there is somewhere to go — the same rule the
                directions link below follows. */}
            {onWatch && (
              <button
                type="button"
                className={styles.watch}
                onClick={onWatch}
              >
                <PlayCircle size={16} aria-hidden="true" />
                {LIVE.watch}
              </button>
            )}
            <button
              type="button"
              className={styles.later}
              onClick={onDismiss}
            >
              {LIVE.dismiss}
            </button>
          </div>
        </div>
      </Lightbox>
    );
  }

  const directions = directionsUrl(countdown.venueName, countdown.venueAddress);
  const venue = [countdown.venueName, countdown.venueAddress]
    .filter((v, i, a) => v && a.indexOf(v) === i)
    .join(', ');
  /* The selected event's own date and time, printed in the event's zone — the
     countdown may point at a sub-event with a date of its own. */
  const when = dateInZone(countdown.startsAt, countdown.timezone);
  const at = timeInZone(countdown.startsAt, countdown.timezone);
  const missed = notification.state === 'missed';

  return (
    <Lightbox
      open={open}
      onClose={onDismiss}
      label={COPY.dismiss}
      closeTone="onLight"
    >
      <div className={styles.card}>
        <span className={styles.bell}>
          <BellRing size={20} strokeWidth={1.6} aria-hidden="true" />
        </span>

        {/* The greeting changes once the day has passed; the words under it
            are the organizer's, and the server chose which of the two. */}
        <h2 className={styles.title}>
          {missed ? COPY.missedTitle : COPY.upcomingTitle}
        </h2>
        <p className={styles.message}>{notification.message}</p>

        {(countdown.name || when || at || venue) && (
          <dl className={styles.facts}>
            {countdown.name && (
              <div className={styles.fact}>
                <dt className={styles.factIcon}>
                  <CalendarDays size={15} aria-hidden="true" />
                </dt>
                <dd className={styles.factName}>{countdown.name}</dd>
              </div>
            )}
            {when && (
              <div className={styles.fact}>
                <dt className={styles.factIcon}>
                  <CalendarDays size={15} aria-hidden="true" />
                </dt>
                <dd className={styles.factText}>{when}</dd>
              </div>
            )}
            {at && (
              <div className={styles.fact}>
                <dt className={styles.factIcon}>
                  <Clock size={15} aria-hidden="true" />
                </dt>
                <dd className={styles.factText}>{at}</dd>
              </div>
            )}
            {venue && (
              <div className={styles.fact}>
                <dt className={styles.factIcon}>
                  <MapPin size={15} aria-hidden="true" />
                </dt>
                <dd className={styles.factText}>{venue}</dd>
              </div>
            )}
          </dl>
        )}

        {/* Offered only when there is somewhere to go. */}
        {directions && (
          <a
            className={styles.directions}
            href={directions}
            target="_blank"
            rel="noreferrer noopener"
          >
            <MapPin size={15} aria-hidden="true" />
            {COPY.directions}
          </a>
        )}

        <button type="button" className={styles.dismiss} onClick={onDismiss}>
          {COPY.dismiss}
        </button>
      </div>
    </Lightbox>
  );
}

export default NotificationModal;
