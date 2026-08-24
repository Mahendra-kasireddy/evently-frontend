import type { BookingStatus, BookingTaskStatus } from './types';

export const EVENT_DETAIL_COPY = {
  totalValue: 'Total value',
  chat: 'Chat with customer',
  chatUnavailable: 'Customer messaging isn’t available yet — the chat module is not wired up.',
  markCompleted: 'Mark event as completed',
  marking: 'Marking…',
  assign: 'Assign',
  unassign: 'Unassign',
  uploadProof: 'Upload photo proof',
  proofAttached: 'Photo attached',
  addTaskPlaceholder: 'Add a task — e.g. Confirm 300-plate catering',
  unassigned: 'Unassigned',
  emptyColumn: 'Nothing here.',
  invitationTitle: 'Guest invitation',
  invitationSub: 'Build the digital invite & send to the customer for approval',
} as const;

/** Statuses from which an organizer may still close the event out. */
export const COMPLETABLE_STATUSES: ReadonlySet<BookingStatus> = new Set<BookingStatus>([
  'confirmed',
  'in_progress',
]);

/** Board columns, in the order the design lays them out. */
export const TASK_COLUMNS: readonly BookingTaskStatus[] = ['todo', 'in_progress', 'done'];

/**
 * Accent per column — the dot, and the due-date text on each card. Maps onto
 * the shared partner tokens rather than introducing new colours.
 */
export const COLUMN_ACCENT: Record<BookingTaskStatus, string> = {
  todo: 'var(--c-muted)',
  in_progress: 'var(--c-amber)',
  done: 'var(--c-teal)',
};

/**
 * The countdown strip's wording. The design shows the future case; the other
 * two are the same strip for an event that is today or already past, so the
 * banner never renders a negative day count.
 */
export function countdownLabel(daysToGo: number, status: BookingStatus): string {
  if (status === 'completed') return 'Event completed';
  if (status === 'cancelled' || status === 'rejected') return 'Event cancelled';
  if (daysToGo > 1) return `${daysToGo} days until event day`;
  if (daysToGo === 1) return 'Tomorrow is event day';
  if (daysToGo === 0) return 'Today is event day';
  const past = Math.abs(daysToGo);
  return past === 1 ? 'Event day was yesterday' : `Event day was ${past} days ago`;
}
