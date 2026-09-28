import { useEffect, useState } from 'react';
import { CalendarDays, Heart, MapPin } from 'lucide-react';
import { countdownFrom, dateInZone, pad2, timeInZone } from './countdown';
import { COUNTDOWN_COPY as COPY } from './constants';
import { Flourish, Rings } from './Ornaments';
import type { GuestCountdown } from './types';
import styles from './CountdownBlock.module.css';

export interface CountdownBlockProps {
  countdown: GuestCountdown;
  /** The chosen template's accent and wash, so the card belongs to the page. */
  accent?: string | undefined;
  wash?: string | undefined;
  /** The organizer's own line above the title, when they wrote one. */
  eyebrow?: string | undefined;
}

const GOLD = '#b0852b';

/**
 * The live countdown, as a card rather than a widget.
 *
 * The server resolved the event's wall-clock date, time and zone into one
 * absolute instant; all this does is subtract. That is why a guest in New York
 * and a guest in Chennai see the same figures, and why nothing here has to
 * know what a timezone is.
 *
 * One interval for the whole block. Each tick reads the clock afresh rather
 * than decrementing a stored figure — a browser throttles timers in a
 * background tab, so a decremented counter drifts while this is correct the
 * moment the tab wakes.
 */
export function CountdownBlock({
  countdown,
  accent,
  wash,
  eyebrow,
}: CountdownBlockProps) {
  const targetMs = countdown.startsAt ? Date.parse(countdown.startsAt) : NaN;
  const valid = Number.isFinite(targetMs);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!valid) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    /* Cleared on unmount and whenever the target changes, so a repointed
       countdown cannot leave a second interval running behind it. */
    return () => window.clearInterval(id);
  }, [valid, targetMs]);

  /* No date on the record: there is nothing to count down to, and a row of
     zeros would read as "starting right now". */
  if (!valid) return null;

  const { days, hours, minutes, seconds, passed } = countdownFrom(
    targetMs,
    now,
  );
  const gold = accent || GOLD;

  const when = dateInZone(countdown.startsAt, countdown.timezone);
  const at = timeInZone(countdown.startsAt, countdown.timezone);
  const venue = [countdown.venueName, countdown.venueAddress]
    .filter((v, i, a) => v && a.indexOf(v) === i)
    .join(', ');

  /*
   * The organizer's message, as they wrote it: the first line carries the
   * announcement and anything after it is the note under it. One field, so
   * the split is by line rather than by a second setting nobody asked for.
   */
  const [headline, ...rest] = (countdown.postEventMessage || COPY.started)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <section
      className={styles.card}
      style={{ background: wash || undefined }}
      aria-label={COPY.label}
    >
      <span className={styles.flourish}>
        <Flourish color={gold} />
      </span>

      <p className={styles.eyebrow}>{COPY.countdownTo}</p>
      {countdown.name && <h2 className={styles.title}>{countdown.name}</h2>}
      {/* The organizer's own line, when they wrote one — never invented here. */}
      {eyebrow && <p className={styles.subtitle}>{eyebrow}</p>}

      {passed ? (
        /*
         * Past the moment, the timer is replaced rather than run negative.
         * `role="status"` so a guest using a screen reader is told it changed.
         */
        <div className={styles.after} role="status">
          <Heart size={22} color={gold} strokeWidth={1.4} aria-hidden="true" />
          <p className={styles.afterHead}>{headline}</p>
          {rest.length > 0 && (
            <p className={styles.afterBody}>{rest.join(' ')}</p>
          )}
        </div>
      ) : (
        <div
          className={styles.row}
          role="timer"
          aria-live="off"
          aria-label={COPY.remaining}
        >
          <Unit value={String(days)} label={COPY.days} />
          <Dot color={gold} />
          <Unit value={pad2(hours)} label={COPY.hours} />
          <Dot color={gold} />
          <Unit value={pad2(minutes)} label={COPY.minutes} />
          <Dot color={gold} />
          <Unit value={pad2(seconds)} label={COPY.seconds} />
        </div>
      )}

      {(when || venue) && (
        <>
          <span className={styles.divider}>
            <i className={styles.rule} style={{ background: gold }} />
            <Rings color={gold} />
            <i className={styles.rule} style={{ background: gold }} />
          </span>

          {when && (
            <p className={styles.fact}>
              <CalendarDays size={14} aria-hidden="true" />
              {/* The text in its own box, so a long line wraps under itself
                  rather than dragging the icon onto a line of its own. */}
              <span>
                {when}
                {at && <span className={styles.sep} aria-hidden="true" />}
                {at}
              </span>
            </p>
          )}
          {venue && (
            <p className={styles.fact}>
              <MapPin size={14} aria-hidden="true" />
              <span>{venue}</span>
            </p>
          )}
        </>
      )}
    </section>
  );
}

function Unit({ value, label }: { value: string; label: string }) {
  return (
    <span className={styles.unit}>
      <strong className={styles.value}>{value}</strong>
      <span className={styles.unitLabel}>{label}</span>
    </span>
  );
}

function Dot({ color }: { color: string }) {
  return (
    <i
      className={styles.dot}
      style={{ background: color }}
      aria-hidden="true"
    />
  );
}

export default CountdownBlock;
