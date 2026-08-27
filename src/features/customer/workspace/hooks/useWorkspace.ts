import { useMemo } from 'react';
import { useGetMyPlansQuery, useGetMyQuotesQuery, useGetMyBookingsQuery } from '../service';
import { useGetMyInvitationsQuery } from '../invitation/service';
import { buildEvents, type InvitationState, type WorkspaceEvent } from '../event-model';

/**
 * Loads the customer's plans, quote requests and bookings, then folds them into
 * one event per real celebration — see `event-model.ts` for why.
 */
export function useWorkspace(): {
  events: WorkspaceEvent[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
} {
  const plansQ = useGetMyPlansQuery();
  const quotesQ = useGetMyQuotesQuery();
  const bookingsQ = useGetMyBookingsQuery();
  // Invitation state decides whether a booked event is waiting on the customer,
  // so it has to be known before the events are sorted into tabs.
  const invitationsQ = useGetMyInvitationsQuery();

  const plans = plansQ.data;
  const quotes = quotesQ.data;
  const bookings = bookingsQ.data;
  const invitations = invitationsQ.data;

  const events = useMemo(() => {
    const byBooking = new Map<string, InvitationState>();
    for (const i of invitations ?? []) {
      byBooking.set(i.bookingId, i.status === 'approved' ? 'published' : 'awaiting-approval');
    }
    return buildEvents(plans ?? [], quotes ?? [], bookings ?? [], byBooking);
  }, [plans, quotes, bookings, invitations]);

  return {
    events,
    isLoading: plansQ.isLoading || quotesQ.isLoading,
    isError: plansQ.isError || quotesQ.isError,
    refetch: () => {
      void plansQ.refetch();
      void quotesQ.refetch();
      void bookingsQ.refetch();
      void invitationsQ.refetch();
    },
  };
}
