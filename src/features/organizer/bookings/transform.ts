import { formatINR } from '@features/organizer/quotes/transform';
import type { BookingStatus, BookingTaskStatus } from './types';

export { formatINR };

const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: 'Awaiting confirmation',
  confirmed: 'Confirmed',
  in_progress: 'In progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  rejected: 'Declined',
};

export function bookingStatusLabel(status: BookingStatus): string {
  return STATUS_LABEL[status] ?? status;
}

const TASK_COLUMN_LABEL: Record<BookingTaskStatus, string> = {
  todo: 'To do',
  in_progress: 'In progress',
  done: 'Done',
};

export function taskStatusLabel(status: BookingTaskStatus): string {
  return TASK_COLUMN_LABEL[status] ?? status;
}

/**
 * "28 Dec 2026" for a booking/task date. Pinned to UTC: dates are stored as
 * a UTC-midnight instant representing a calendar day (see backend
 * `deriveEventDate`), so formatting in the viewer's local zone could shift
 * the displayed day by ±1 depending on their UTC offset.
 */
export function dateLabel(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/** "Sat" short weekday for the 7-day schedule strip — see `dateLabel` re UTC. */
export function weekdayLabel(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { weekday: 'short', timeZone: 'UTC' });
}
