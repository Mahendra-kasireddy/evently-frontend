import type { ApiBooking, BookingStatus, PaymentStatus } from '@features/customer/booking/types';

export const BOOKING_DETAIL_ROUTE = '/booking-details';

/** Where the back control returns to — this screen is a child of My Events. */
export const PARENT_ROUTE = '/workspace';
export const PARENT_LABEL = 'My Events';

/**
 * Presentation for the booking axis only. Payment lives in `PAYMENT_META`
 * below — the two are never folded into one badge, because "paid but not yet
 * confirmed" is a real, common state that one label cannot describe honestly.
 */
export const STATUS_META: Record<BookingStatus, { label: string; cls: string }> = {
  pending: { label: 'Booking placed', cls: 'placed' },
  awaiting_organizer: { label: 'Awaiting organizer', cls: 'awaiting' },
  confirmed: { label: 'Organizer confirmed', cls: 'confirmed' },
  in_progress: { label: 'Event in progress', cls: 'progress' },
  completed: { label: 'Completed', cls: 'completed' },
  cancelled: { label: 'Cancelled', cls: 'closed' },
  rejected: { label: 'Declined by organizer', cls: 'closed' },
  expired: { label: 'Expired — no response', cls: 'closed' },
};

export const PAYMENT_META: Record<PaymentStatus, { label: string; cls: string }> = {
  unpaid: { label: 'Payment pending', cls: 'unpaid' },
  advance_paid: { label: 'Advance paid', cls: 'paid' },
  paid_in_full: { label: 'Paid in full', cls: 'paid' },
};

/** Statuses where the customer may still cancel. */
export const CANCELLABLE: BookingStatus[] = ['pending', 'awaiting_organizer', 'confirmed'];

/** Statuses that are over — the screen drops its forward-looking chrome. */
export const CLOSED: BookingStatus[] = ['cancelled', 'rejected', 'expired'];

/** Statuses where the event workspace is worth opening. */
export const WORKSPACE_READY: BookingStatus[] = ['confirmed', 'in_progress', 'completed'];

/**
 * The single sentence answering "what happens next?" — the question the old
 * screen left unanswered while showing a bare "Pending" chip.
 */
export function nextStepCopy(b: ApiBooking): { title: string; body: string } {
  const organizer = b.organizer?.name ?? 'Your organizer';
  switch (b.status) {
    case 'pending':
      return {
        title: 'Finish your advance payment',
        body: 'Your date is held until the advance is settled.',
      };
    case 'awaiting_organizer':
      return {
        title: `Waiting for ${organizer} to confirm`,
        body: deadlineCopy(b.organizerRespondBy),
      };
    case 'confirmed':
      return {
        title: 'Your booking is confirmed',
        body: `${organizer} accepted. Plan the details in your event workspace — the balance is due after the event.`,
      };
    case 'in_progress':
      return {
        title: 'Your event is under way',
        body: `${organizer} is delivering your event. Track progress in the workspace.`,
      };
    case 'completed':
      return { title: 'Event delivered', body: 'Thanks for booking with Evently.' };
    case 'rejected':
      return {
        title: `${organizer} declined this booking`,
        body: b.declineReason
          ? `Reason: ${b.declineReason} Your advance is eligible for a refund.`
          : 'Your advance is eligible for a refund. You can request quotes from another organizer.',
      };
    case 'expired':
      return {
        title: 'The organizer did not respond in time',
        body: 'Your advance is eligible for a refund. You can request quotes from another organizer.',
      };
    case 'cancelled':
    default:
      return { title: 'This booking was cancelled', body: 'No further action is needed.' };
  }
}

/** "They have until Fri, 29 Aug" — or a neutral line when no deadline is set. */
function deadlineCopy(respondBy: string | null): string {
  if (!respondBy) return 'We have notified them and will let you know as soon as they answer.';
  const d = new Date(respondBy);
  if (Number.isNaN(d.getTime())) {
    return 'We have notified them and will let you know as soon as they answer.';
  }
  const when = d.toLocaleString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
  return `They have until ${when} to accept or decline. Your advance is refundable if they do not.`;
}
