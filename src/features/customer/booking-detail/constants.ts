import type { BookingStatus } from '@features/customer/booking/types';

export const BOOKING_DETAIL_ROUTE = '/booking-details';

/** Presentation for each booking status (label + CSS class name). */
export const STATUS_META: Record<BookingStatus, { label: string; cls: string }> = {
  pending: { label: 'Pending', cls: 'pending' },
  confirmed: { label: 'Confirmed', cls: 'confirmed' },
  in_progress: { label: 'In progress', cls: 'progress' },
  completed: { label: 'Completed', cls: 'completed' },
  cancelled: { label: 'Cancelled', cls: 'cancelled' },
  rejected: { label: 'Rejected', cls: 'rejected' },
};

/** Statuses where the customer may still cancel. */
export const CANCELLABLE: BookingStatus[] = ['pending', 'confirmed'];
