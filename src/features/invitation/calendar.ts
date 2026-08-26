/**
 * Handing a Save-the-Date card to the guest's own calendar app.
 *
 * There is no web API that adds an event to a phone's calendar, and a page
 * cannot choose which app opens. What actually works is a handoff, and there
 * are exactly two that reach every device:
 *
 *   - an `.ics` file (RFC 5545). iOS opens it in Apple Calendar, Android hands
 *     it to whichever calendar app is registered, desktop hands it to Outlook
 *     or Calendar. The OS decides, which is why this is offered by default.
 *   - a Google Calendar template URL, which opens Google Calendar specifically.
 *
 * Either way the guest still confirms in their own app, so dismissing the
 * prompt adds nothing — the "does not force it" rule is a property of the
 * handoff rather than something this code has to enforce.
 *
 * Nothing here pushes later edits into a calendar the guest already saved.
 * That is also inherent: once the entry is theirs, this app has no channel to
 * it. The invitation page always shows current detail; the saved entry does
 * not change.
 */

import { zonedInstant } from './countdown';

/** The fields a calendar entry needs from a card. */
export interface CalendarEvent {
  /** Stable per card, used as the iCalendar UID. */
  id: string;
  name: string;
  /** `yyyy-mm-dd`. */
  eventDate: string;
  /** `HH:mm`. */
  eventTime: string;
  /** `HH:mm`; blank falls back to `defaultMinutes` after the start. */
  endTime: string;
  timezone: string;
  venueName: string;
  venueAddress: string;
  dressCode: string;
  note: string;
}

export interface CalendarContext {
  /** Names the celebration the card belongs to, for the entry's description. */
  invitationName: string;
  /** Duration when the organizer gave no end time. */
  defaultMinutes: number;
}

/** `20261228T133000Z` — the UTC form, so no VTIMEZONE block is needed. */
export function icsStamp(instantMs: number): string {
  const d = new Date(instantMs);
  const p = (n: number) => String(n).padStart(2, '0');
  return (
    `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}` +
    `T${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}Z`
  );
}

/**
 * The start and end instants of a card, or null when it has no date.
 *
 * The end is the organizer's end time when they gave one, and the default
 * duration otherwise. An end time earlier than the start reads as crossing
 * midnight — a reception running to 01:00 is ordinary — so it rolls to the
 * next day rather than producing a negative-length entry that calendar apps
 * quietly discard.
 */
export function instantsFor(
  event: CalendarEvent,
  defaultMinutes: number,
): { start: number; end: number } | null {
  const start = zonedInstant(event.eventDate, event.eventTime, event.timezone);
  if (start === null) return null;

  const explicitEnd = event.endTime
    ? zonedInstant(event.eventDate, event.endTime, event.timezone)
    : null;

  if (explicitEnd === null) {
    return { start, end: start + Math.max(1, defaultMinutes) * 60_000 };
  }
  const end = explicitEnd <= start ? explicitEnd + 86_400_000 : explicitEnd;
  return { start, end };
}

/**
 * Escapes a value for an iCalendar property: backslash, semicolon and comma
 * are delimiters, and a newline has to become the two-character sequence `\n`.
 */
export function icsEscape(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n|\r|\n/g, '\\n');
}

/**
 * Folds a content line to 75 octets, continuation lines starting with a space.
 *
 * Counted in octets rather than characters because the limit is a byte limit,
 * and a multi-byte character must not be split across the fold — an address
 * with an accent or an emoji in a note would otherwise produce a file some
 * calendar apps reject outright.
 */
export function foldLine(line: string): string {
  const encoder = new TextEncoder();
  const out: string[] = [];
  let current = '';
  let bytes = 0;
  // 75 for the first line; continuations spend one octet on the leading space.
  let limit = 75;

  for (const char of line) {
    const size = encoder.encode(char).length;
    if (bytes + size > limit) {
      out.push(current);
      current = '';
      bytes = 0;
      limit = 74;
    }
    current += char;
    bytes += size;
  }
  out.push(current);
  return out.join('\r\n ');
}

/** What the guest reads inside the calendar entry. */
function describe(event: CalendarEvent, ctx: CalendarContext): string {
  const lines = [ctx.invitationName].filter(Boolean);
  if (event.dressCode) lines.push(`Dress code: ${event.dressCode}`);
  if (event.note) lines.push(event.note);
  return lines.join('\n');
}

/** Venue name and address, without repeating one that is also the other. */
export function locationOf(event: CalendarEvent): string {
  return [event.venueName, event.venueAddress]
    .filter((v, i, all) => v && all.indexOf(v) === i)
    .join(', ');
}

/**
 * A complete single-event iCalendar document, or null when the card has no
 * date to put in it.
 *
 * `dtStampMs` is passed in rather than read from the clock so the output is a
 * pure function of its inputs — which is what makes it testable.
 */
export function buildIcs(
  event: CalendarEvent,
  ctx: CalendarContext,
  dtStampMs: number,
): string | null {
  const span = instantsFor(event, ctx.defaultMinutes);
  if (span === null) return null;

  const description = describe(event, ctx);
  const location = locationOf(event);

  const props: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Evently//Invitation//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    // Stable per card, so a guest who taps twice updates their entry instead
    // of ending up with two. It is not a channel for later edits: nothing
    // re-sends this file after the guest has saved it.
    `UID:${event.id || event.eventDate}-evently@invitation`,
    `DTSTAMP:${icsStamp(dtStampMs)}`,
    `DTSTART:${icsStamp(span.start)}`,
    `DTEND:${icsStamp(span.end)}`,
    `SUMMARY:${icsEscape(event.name)}`,
  ];
  if (location) props.push(`LOCATION:${icsEscape(location)}`);
  if (description) props.push(`DESCRIPTION:${icsEscape(description)}`);
  props.push('END:VEVENT', 'END:VCALENDAR');

  // CRLF throughout, and a trailing one: RFC 5545 lines end with CRLF, and
  // some parsers drop a final line that has no terminator.
  return props.map(foldLine).join('\r\n') + '\r\n';
}

/** `20261228T133000Z/20261228T163000Z`, the form Google's template expects. */
export function googleCalendarUrl(
  event: CalendarEvent,
  ctx: CalendarContext,
): string | null {
  const span = instantsFor(event, ctx.defaultMinutes);
  if (span === null) return null;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.name,
    dates: `${icsStamp(span.start)}/${icsStamp(span.end)}`,
  });
  const location = locationOf(event);
  const details = describe(event, ctx);
  if (location) params.set('location', location);
  if (details) params.set('details', details);

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** A filename a guest can recognise in their downloads. */
export function icsFileName(event: CalendarEvent): string {
  const slug = event.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${slug || 'event'}.ics`;
}

/**
 * Whether this device's calendar is Apple's.
 *
 * Used only to decide which handoff to put behind the primary button; both are
 * always reachable, so a wrong guess costs a guest one extra tap rather than
 * the feature. iPadOS reports itself as a Mac with touch support, hence the
 * second clause.
 */
export function prefersAppleCalendar(
  userAgent: string,
  maxTouchPoints: number,
): boolean {
  if (/iPhone|iPad|iPod/i.test(userAgent)) return true;
  return /Macintosh/i.test(userAgent) && maxTouchPoints > 1;
}
