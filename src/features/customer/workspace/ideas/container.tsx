import { useNavigate } from 'react-router-dom';
import { CalendarSearch } from 'lucide-react';
import { LoadingScreen, ErrorState, EmptyState } from '@shared/components';
import { BoardScreen } from '@features/board';
import { useGetBookingQuery } from '@features/customer/booking/service';
import { useGetProfileSummaryQuery } from '@features/customer/home/profile.service';
import { bookedWorkspaceRoute, MY_EVENTS_ROUTE } from '../routes';
import { useGetIdeaBoardQuery, useCreateIdeaMutation, useApproveIdeaMutation } from './service';

/**
 * My Events → a booked event → its ideas & planning board.
 *
 * The board itself is the shared component both roles render; this side supplies
 * the customer's actions — posting an idea and approving what the organizer
 * asked about. The vision is read-only here: the organizer writes it.
 */
export function IdeasContainer({ bookingId }: { bookingId: string }) {
  const navigate = useNavigate();
  // The same summary the header's avatar comes from, so the composer shows the
  // customer their own monogram rather than a placeholder letter.
  const { data: profile } = useGetProfileSummaryQuery();
  const bookingQ = useGetBookingQuery(bookingId, { skip: !bookingId });
  const boardQ = useGetIdeaBoardQuery(bookingId, {
    skip: !bookingId,
    refetchOnMountOrArgChange: true,
  });
  const [post, postState] = useCreateIdeaMutation();
  const [approve, approveState] = useApproveIdeaMutation();

  if (bookingQ.isLoading || boardQ.isLoading) {
    return <LoadingScreen message="Opening the planning board…" />;
  }

  if (bookingQ.isError || boardQ.isError) {
    return (
      <ErrorState
        message="We couldn't load the planning board. Please check your connection and try again."
        onRetry={() => {
          void bookingQ.refetch();
          void boardQ.refetch();
        }}
      />
    );
  }

  if (!bookingQ.data || !boardQ.data) {
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

  const b = bookingQ.data;
  const organizerName = b.organizer?.name ?? 'Your organizer';

  return (
    <BoardScreen
      role="customer"
      board={boardQ.data}
      authorName={profile?.name || 'You'}
      counterpartName={organizerName}
      organizerName={organizerName}
      backLabel="Event workspace"
      eventTitle={b.title || 'This event'}
      eventDate={b.eventDate}
      isPosting={postState.isLoading}
      isApproving={approveState.isLoading}
      onPost={(draft) => {
        void post({
          bookingId,
          body: {
            text: draft.text,
            type: draft.type,
            confidential: draft.confidential,
            images: draft.images,
          },
        });
      }}
      onApprove={(ideaId) => {
        void approve(ideaId);
      }}
      onBack={() => navigate(bookedWorkspaceRoute(bookingId))}
    />
  );
}
