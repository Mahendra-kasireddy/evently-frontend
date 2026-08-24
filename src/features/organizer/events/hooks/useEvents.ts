import { useGetOrganizerBookingsQuery } from '@features/organizer/bookings/service';

const TERMINAL = new Set(['cancelled', 'rejected', 'completed']);

/** The organizer's non-terminal bookings — what's actively being delivered. */
export function useEvents() {
  const query = useGetOrganizerBookingsQuery();
  const bookings = (query.data ?? []).filter((b) => !TERMINAL.has(b.status));
  return {
    bookings,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
