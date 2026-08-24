import { useNavigate } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';
import { LoadingScreen, ErrorState, EmptyState } from '@shared/components';
import { BoardScreen } from '@features/board';
import { useGetOrganizerBookingQuery } from '@features/organizer/bookings/service';
import {
  useGetOrganizerIdeasQuery,
  usePostOrganizerIdeaMutation,
  useReplyToIdeaMutation,
  useUpdateVisionMutation,
} from './service';

/**
 * The organizer's ideas & planning board for one booking.
 *
 * The same screen the customer reads, with the organizer's actions: post an
 * update or a question, turn any of their ideas into a plan, and record the
 * event vision the customer reads back. The board is a screen of its own rather
 * than a panel on the event page so it has room for the feed — the event page
 * links to it.
 */
export function OrganizerIdeasContainer({ bookingId }: { bookingId: string }) {
  const navigate = useNavigate();
  const bookingQ = useGetOrganizerBookingQuery(bookingId, { skip: !bookingId });
  const boardQ = useGetOrganizerIdeasQuery(bookingId, {
    skip: !bookingId,
    refetchOnMountOrArgChange: true,
  });
  const [post, postState] = usePostOrganizerIdeaMutation();
  const [reply, replyState] = useReplyToIdeaMutation();
  const [saveVision, visionState] = useUpdateVisionMutation();

  const backToEvent = () => navigate(`/organizer/events/${bookingId}`);

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
          icon={FileQuestion}
          title="Event not found"
          message="This booking isn’t on your list anymore, or the link is out of date."
          actionLabel="Back to events"
          onAction={() => navigate('/organizer/events')}
        />
      </div>
    );
  }

  const b = bookingQ.data;
  const clientName = b.customer?.name ?? 'Your client';
  const organizerName = b.organizer?.name ?? 'Your team';

  return (
    <BoardScreen
      role="organizer"
      board={boardQ.data}
      authorName={organizerName}
      counterpartName={clientName}
      organizerName={organizerName}
      backLabel="Event workspace"
      eventTitle={b.title || 'This event'}
      eventDate={b.eventDate}
      isPosting={postState.isLoading}
      isReplying={replyState.isLoading}
      isSavingVision={visionState.isLoading}
      onPost={(draft) => {
        void post({
          bookingId,
          body: { text: draft.text, type: draft.type, images: draft.images },
        });
      }}
      onReply={(ideaId, draft) => {
        void reply({
          ideaId,
          body: {
            status: draft.status,
            text: draft.text,
            ...(draft.approvalLabel ? { approvalLabel: draft.approvalLabel } : {}),
          },
        });
      }}
      onSaveVision={(patch) => {
        void saveVision({ bookingId, body: patch });
      }}
      onBack={backToEvent}
    />
  );
}
