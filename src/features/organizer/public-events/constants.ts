import type { LiveState, PublicEventStatus, TicketTypeStatus } from './types';

/**
 * What each status is called and how it reads.
 *
 * The words are the organizer's, not the database's: `sold_out` is a column
 * value, "Sold out" is what a person is told.
 */
export const EVENT_STATUS_LABEL: Record<PublicEventStatus, string> = {
  draft: 'Draft',
  published: 'Published',
  sold_out: 'Sold out',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

/** The tone each status is drawn in. Keys match `styles.module.css`. */
export const EVENT_STATUS_TONE: Record<PublicEventStatus, string> = {
  draft: 'neutral',
  published: 'live',
  sold_out: 'full',
  completed: 'done',
  cancelled: 'off',
};

export const TICKET_STATUS_LABEL: Record<TicketTypeStatus, string> = {
  active: 'On sale',
  paused: 'Paused',
};

export const LIVE_STATE_LABEL: Record<LiveState, string> = {
  upcoming: 'Upcoming',
  live: 'Live now',
  ended: 'Ended',
};

/**
 * The filters above the list.
 *
 * "All" first, then the two an organizer actually switches between — what is
 * still being written, and what the public can see.
 */
export const LIST_FILTERS: Array<{ key: PublicEventStatus | 'all'; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'draft', label: 'Drafts' },
  { key: 'published', label: 'Published' },
  { key: 'sold_out', label: 'Sold out' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

/** Who may add to a public event's gallery, in the organizer's words. */
export const UPLOADER_OPTIONS: Array<{
  value: 'checked_in' | 'ticket_holders' | 'nobody';
  label: string;
  hint: string;
}> = [
  {
    value: 'checked_in',
    label: 'People who came',
    hint: 'Only attendees scanned in at the door. Recommended for a paid event.',
  },
  {
    value: 'ticket_holders',
    label: 'Anyone with a ticket',
    hint: 'Including people who bought a ticket but did not attend.',
  },
  { value: 'nobody', label: 'Nobody', hint: 'The gallery is yours to fill; guests can only look.' },
];

/** Hosts whose players can be embedded. Mirrors the server's own allowlist. */
export const LIVE_HELP =
  'Paste the link you would share. YouTube, Vimeo, Twitch, Facebook and Cloudflare Stream, over https.';

/** Rupees from the smallest unit the API stores. */
export function formatMoney(amount: number): string {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

/** A date and time in the event's own zone, so an organizer reads their own clock. */
export function formatInZone(iso: string | null | undefined, timezone: string): string {
  if (!iso) return '—';
  const at = new Date(iso);
  if (Number.isNaN(at.getTime())) return '—';
  try {
    return new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: timezone || undefined,
    }).format(at);
  } catch {
    /* An unknown zone is the organizer's typo, not a reason to show nothing. */
    return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(at);
  }
}

/**
 * An ISO instant as the value a `datetime-local` input wants.
 *
 * The input has no concept of a zone, so this deliberately renders the browser's
 * local clock — and the form says as much next to it, rather than letting an
 * organizer in Hyderabad guess whose 7pm they are typing.
 */
export function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return '';
  const at = new Date(iso);
  if (Number.isNaN(at.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${at.getFullYear()}-${pad(at.getMonth() + 1)}-${pad(at.getDate())}T${pad(
    at.getHours(),
  )}:${pad(at.getMinutes())}`;
}

/** Back the other way: what the input holds, as an instant. */
export function fromLocalInput(value: string): string | undefined {
  if (!value) return undefined;
  const at = new Date(value);
  return Number.isNaN(at.getTime()) ? undefined : at.toISOString();
}
