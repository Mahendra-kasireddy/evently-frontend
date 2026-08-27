import { useNavigate } from 'react-router-dom';
import { CalendarSearch } from 'lucide-react';
import { LoadingScreen, ErrorState, EmptyState } from '@shared/components';
import { useGetBookingQuery } from '@features/customer/booking/service';
import { ideasRoute, invitationRoute, MY_EVENTS_ROUTE } from '../routes';
import { useGetIdeaBoardQuery } from '../ideas/service';
import { useGetMyInvitationQuery } from '../invitation/service';
import { Component } from './Component';

/**
 * My Events → one booked event's workspace.
 *
 * The invitation query is expected to fail while the organizer is still drafting
 * (the API 404s that case on purpose), so its error is not surfaced — the block
 * is simply absent until an invitation has been shared.
 */
export function BookedWorkspaceContainer({ bookingId }: { bookingId: string }) {
  const navigate = useNavigate();
  const { data: booking, isLoading, isError, refetch } = useGetBookingQuery(bookingId, {
    skip: !bookingId,
  });
  const { data: invitation } = useGetMyInvitationQuery(bookingId, { skip: !bookingId });
  // Same cache entry the board screen uses, so posting there updates these counts.
  const { data: board } = useGetIdeaBoardQuery(bookingId, { skip: !bookingId });

  if (isLoading) return <LoadingScreen message="Opening your workspace…" />;

  if (isError) {
    return (
      <ErrorState
        message="We couldn't load this event's workspace. Please check your connection and try again."
        onRetry={refetch}
      />
    );
  }

  if (!booking) {
    return (
      <div style={{ maxWidth: 640, margin: '72px auto', padding: '0 20px' }}>
        <EmptyState
          icon={CalendarSearch}
          title="Event not found"
          message="This booking isn’t in your list anymore, or the link is out of date."
          actionLabel="Back to My Events"
          onAction={() => navigate(MY_EVENTS_ROUTE)}
        />
      </div>
    );
  }

  return (
    <Component
      booking={booking}
      invitation={invitation}
      ideaCounts={board?.counts ?? { shared: 0, planned: 0, awaitingApproval: 0 }}
      onOpenIdeas={() => navigate(ideasRoute(bookingId))}
      onOpenInvitation={() => navigate(invitationRoute(bookingId))}
    />
  );
}
