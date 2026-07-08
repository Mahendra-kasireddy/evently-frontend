import { useGetMyPlansQuery, useGetMyQuotesQuery, useGetMyBookingsQuery } from '../service';

/** Loads the customer's real plans + quote requests + bookings for the workspace. */
export function useWorkspace() {
  const plansQ = useGetMyPlansQuery();
  const quotesQ = useGetMyQuotesQuery();
  const bookingsQ = useGetMyBookingsQuery();

  return {
    plans: plansQ.data ?? [],
    quotes: quotesQ.data ?? [],
    bookings: bookingsQ.data ?? [],
    isLoading: plansQ.isLoading || quotesQ.isLoading || bookingsQ.isLoading,
    isError: plansQ.isError || quotesQ.isError || bookingsQ.isError,
    refetch: () => {
      void plansQ.refetch();
      void quotesQ.refetch();
      void bookingsQ.refetch();
    },
  };
}
