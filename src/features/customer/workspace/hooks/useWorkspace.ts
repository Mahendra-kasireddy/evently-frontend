import { useGetMyPlansQuery, useGetMyQuotesQuery, useGetMyBookingsQuery } from '../service';

/** Loads the customer's real plans + quote requests + bookings for the workspace. */
export function useWorkspace() {
  const plansQ = useGetMyPlansQuery();
  const quotesQ = useGetMyQuotesQuery();
  const bookingsQ = useGetMyBookingsQuery();

  return {
    plans: plansQ.data ?? [],
    quotes: quotesQ.data ?? [],
    // Bookings are supplementary — a failure here (e.g. an older backend without
    // the endpoint) must not blank out the whole workspace.
    bookings: bookingsQ.data ?? [],
    isLoading: plansQ.isLoading || quotesQ.isLoading,
    isError: plansQ.isError || quotesQ.isError,
    refetch: () => {
      void plansQ.refetch();
      void quotesQ.refetch();
      void bookingsQ.refetch();
    },
  };
}
