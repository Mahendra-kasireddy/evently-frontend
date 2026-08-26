import { useEffect, useState } from 'react';
import { countdownFrom, zonedInstant, type CountdownParts } from './countdown';

/**
 * A live countdown to the invitation's event, ticking once a second.
 *
 * Only the current instant is state; the days/hours/minutes/seconds are derived
 * from it and the target on every render. That keeps the render pure and means
 * a change to the date, time or zone is reflected on the very next render
 * rather than at the next tick.
 *
 * Each tick reads `Date.now()` afresh instead of decrementing a stored value —
 * see `countdownFrom` for why that matters when the tab is backgrounded.
 */
export function useCountdown(
  eventDate: string,
  eventTime: string,
  timeZone: string,
): CountdownParts & { targetMs: number | null } {
  const targetMs = zonedInstant(eventDate, eventTime, timeZone);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    // Nothing to count down to, so nothing to tick.
    if (targetMs === null) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [targetMs]);

  return { ...countdownFrom(targetMs, now), targetMs };
}
