/**
 * Countdown maths for the guest invitation.
 *
 * `details.eventDate` (`yyyy-mm-dd`) and `details.eventTime` (`HH:mm`) are
 * wall-clock strings with no zone attached — right for printing "Saturday 28
 * December", wrong for counting down, because "7pm" means a different instant
 * in Hyderabad than in London. `details.timezone` supplies the missing half,
 * and everything here resolves the three together into one UTC instant that
 * every viewer counts down to identically.
 *
 * No date library: `Intl` already carries the zone database, so pulling one in
 * for this would add weight without adding correctness.
 */

/**
 * The zone's offset from UTC, in ms, at a given instant.
 *
 * Formats the instant in the target zone, reads the printed parts back as if
 * they were UTC, and takes the difference. Positive east of Greenwich.
 */
function offsetMsAt(instantMs: number, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(new Date(instantMs));

  const read = (type: Intl.DateTimeFormatPartTypes): number => {
    const found = parts.find((p) => p.type === type);
    return found ? Number(found.value) : 0;
  };

  const asIfUtc = Date.UTC(
    read('year'),
    read('month') - 1,
    read('day'),
    read('hour'),
    read('minute'),
    read('second'),
  );
  return asIfUtc - instantMs;
}

/**
 * The UTC instant of a wall-clock date and time in a given zone, or null when
 * either field is missing or malformed.
 *
 * Two passes: the offset itself depends on the instant (a zone's offset shifts
 * across a DST boundary), so the first pass gets close and the second settles
 * it. That is exact everywhere except inside a transition hour, where the wall
 * time is genuinely ambiguous or non-existent and any answer is a choice.
 */
export function zonedInstant(
  eventDate: string,
  eventTime: string,
  timeZone: string,
): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) return null;
  const time = /^([01]\d|2[0-3]):[0-5]\d$/.test(eventTime) ? eventTime : '00:00';

  const [y, m, d] = eventDate.split('-').map(Number) as [number, number, number];
  const [hh, mm] = time.split(':').map(Number) as [number, number];

  const zone = timeZone && isKnownZone(timeZone) ? timeZone : 'UTC';
  const wallAsUtc = Date.UTC(y, m - 1, d, hh, mm, 0, 0);
  if (Number.isNaN(wallAsUtc)) return null;

  let instant = wallAsUtc - offsetMsAt(wallAsUtc, zone);
  instant = wallAsUtc - offsetMsAt(instant, zone);
  return instant;
}

/** Whether the runtime knows this zone. An unknown one falls back to UTC. */
export function isKnownZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone }).format(0);
    return true;
  } catch {
    return false;
  }
}

export interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** Milliseconds left, floored at 0. */
  remainingMs: number;
  /** True once the target instant is in the past. */
  passed: boolean;
}

const ZERO: CountdownParts = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  remainingMs: 0,
  passed: true,
};

/**
 * Splits the gap between now and the target into days/hours/minutes/seconds.
 *
 * Derived from two absolute instants every time it is called rather than by
 * decrementing a stored counter — a browser throttles timers in a background
 * tab, so a counter drifts while this stays correct the moment the tab wakes.
 */
export function countdownFrom(targetMs: number | null, nowMs: number): CountdownParts {
  if (targetMs === null) return { ...ZERO, passed: false };
  const remainingMs = targetMs - nowMs;
  if (remainingMs <= 0) return ZERO;

  const totalSeconds = Math.floor(remainingMs / 1000);
  return {
    days: Math.floor(totalSeconds / 86_400),
    hours: Math.floor((totalSeconds % 86_400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    remainingMs,
    passed: false,
  };
}

/** Two digits, for the hour/minute/second boxes. */
export function pad2(value: number): string {
  return String(value).padStart(2, '0');
}
