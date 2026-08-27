import { useGetOrganizerBookingsQuery } from '@features/organizer/bookings/service';
import type { ApiBooking, BookingStatus } from '../types';

const TERMINAL = new Set<BookingStatus>(['cancelled', 'rejected', 'completed', 'expired']);
const AWAITING = new Set<BookingStatus>(['pending', 'awaiting_organizer']);

/**
 * The organizer's non-terminal bookings, split by whether they still owe the
 * customer an answer. Bookings awaiting confirmation are listed first and
 * separately — buried in the same list, a paid booking waiting on this
 * organizer looks identical to one already under way.
 */
export function useEvents() {
  const query = useGetOrganizerBookingsQuery();
  const live = (query.data ?? []).filter((b: ApiBooking) => !TERMINAL.has(b.status));
  return {
    awaiting: live.filter((b: ApiBooking) => AWAITING.has(b.status)),
    bookings: live.filter((b: ApiBooking) => !AWAITING.has(b.status)),
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
