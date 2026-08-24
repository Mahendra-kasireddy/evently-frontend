import { Navigate } from 'react-router-dom';
import { LoadingScreen } from '@shared/components';
import { useGetMyBookingsQuery } from '@features/customer/booking/service';
import { invitationRoute, MY_EVENTS_ROUTE } from '@features/customer/workspace/routes';

/**
 * `/my-invitation` — an entry point, not a screen.
 *
 * An invitation only exists for a booked event, so this resolves which event the
 * customer means and forwards into My Events, where the invitation is reviewed
 * in the context of its booking. With one booking that is unambiguous; with
 * several the hub is the honest answer, since it lists them all.
 *
 * The screen this replaced was a hardcoded "No invitation yet" panel that said
 * the same thing whether or not an invitation existed.
 */
export function MyInvitationPage() {
  const { data: bookings, isLoading } = useGetMyBookingsQuery();

  if (isLoading) return <LoadingScreen message="Finding your event…" />;

  const only = bookings?.length === 1 ? bookings[0] : undefined;
  if (only) {
    // The invitation route handles "not shared yet" itself, so it is safe to
    // send them straight there without first asking whether one exists.
    return <Navigate to={invitationRoute(only.id)} replace />;
  }

  // None, or several — the hub lists them, so let the customer choose rather
  // than guessing at one.
  return <Navigate to={MY_EVENTS_ROUTE} replace />;
}

export default MyInvitationPage;
