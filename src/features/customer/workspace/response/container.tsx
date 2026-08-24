import { useNavigate } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';
import { LoadingScreen, ErrorState, EmptyState } from '@shared/components';
import { useQuoteDetail } from '@features/customer/quote-detail/hooks';
import { Component as ResponseComponent } from '@features/customer/quote-detail/Component';
import { useGetQuoteRequestsQuery } from '@features/customer/quotes/service';
import { EventTrail } from '../sections/EventTrail';
import { MY_EVENTS_ROUTE, eventRoute } from '../routes';
import { eventLabel } from '../label';

/**
 * My Events → one event → one organizer's response, in full.
 *
 * The itemised breakdown and payment summary are the existing quote-detail view,
 * reused unchanged. This container supplies the trail (My Events › event ›
 * organizer) and keeps every outcome inside the section: accepting moves on to
 * checkout, declining returns to the event where the response now reads
 * "Declined", and back goes up one level rather than into browser history.
 */
export function WorkspaceResponseContainer({
  requestId,
  quotationId,
}: {
  requestId: string;
  quotationId: string;
}) {
  const navigate = useNavigate();
  const { data, rawStatus, isLoading, isError, refetch, accept, reject, isActing } =
    useQuoteDetail(quotationId);
  // Shares the cache the hub already populated — the label costs no extra request.
  const { data: requests = [] } = useGetQuoteRequestsQuery();
  const request = requests.find((r) => r.id === requestId);
  const label = request ? eventLabel(request) : 'This event';
  const eventTo = eventRoute(requestId);

  if (isLoading) return <LoadingScreen message="Opening this response…" />;

  if (isError) {
    return (
      <ErrorState
        message="We couldn't load this response. It may have been withdrawn, or your link is out of date."
        onRetry={refetch}
      />
    );
  }

  if (!data) {
    return (
      <div style={{ maxWidth: 640, margin: '72px auto', padding: '0 20px' }}>
        <EmptyState
          icon={FileQuestion}
          title="Response not available"
          message="This organizer’s response isn’t available anymore — it may have been withdrawn."
          actionLabel="Back to this event"
          onAction={() => navigate(eventTo)}
        />
      </div>
    );
  }

  return (
    <>
      <EventTrail
        crumbs={[
          { label: 'My Events', to: MY_EVENTS_ROUTE },
          { label, to: eventTo },
        ]}
        current={data.name}
      />
      <ResponseComponent
        q={data}
        rawStatus={rawStatus}
        isActing={isActing}
        onAccept={accept}
        onReject={reject}
        /* No `onBack`: the trail above already carries the one back control. */
        onAccepted={() => navigate(`/booking/${quotationId}`)}
        onRejected={() => navigate(eventTo)}
      />
    </>
  );
}
