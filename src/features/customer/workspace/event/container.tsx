import { useNavigate } from 'react-router-dom';
import { CalendarSearch } from 'lucide-react';
import { LoadingScreen, ErrorState, EmptyState } from '@shared/components';
import { useQuotes } from '@features/customer/quotes/hooks';
import { Component as CompareComponent } from '@features/customer/quotes/Component';
import { BackPill } from '../sections';
import { MY_EVENTS_ROUTE, responseRoute } from '../routes';
import { eventLabel } from '../label';
import styles from './styles.module.css';

/**
 * My Events → one event: compare the organizer responses to it.
 *
 * The comparison itself is the existing quotes view, reused unchanged. This
 * container only supplies the event (from the path, never a heuristic), the
 * breadcrumb, and the destinations — so reviewing a response goes one level
 * deeper inside My Events instead of off to an unrelated screen.
 */
export function WorkspaceEventContainer({ requestId }: { requestId: string }) {
  const navigate = useNavigate();
  const { detail, notFound, isLoading, isError, refetch, cancel, isActing } = useQuotes(requestId);

  if (isLoading) return <LoadingScreen message="Opening this event…" />;

  if (isError) {
    return (
      <ErrorState
        message="We couldn't load this event's responses. Please check your connection and try again."
        onRetry={refetch}
      />
    );
  }

  // A path naming a request this customer does not have. Say so plainly and point
  // back to the hub, rather than quietly showing them a different event.
  if (notFound || !detail) {
    return (
      <div style={{ maxWidth: 640, margin: '72px auto', padding: '0 20px' }}>
        <EmptyState
          icon={CalendarSearch}
          title="Event not found"
          message="This event isn’t in your list anymore. It may have been cancelled, or the link is out of date."
          actionLabel="Back to My Events"
          onAction={() => navigate(MY_EVENTS_ROUTE)}
        />
      </div>
    );
  }

  return (
    <>
      {/* One level below the hub, so a pill — a breadcrumb with a single
          ancestor was just a back button that took two lines to say so. */}
      <div className={styles.nav}>
        <BackPill to={MY_EVENTS_ROUTE} label="My Events" />
        <span className={styles.here}>{eventLabel(detail)}</span>
      </div>
      <CompareComponent
        detail={detail}
        /* The hub is the event picker; a second picker here is what made the
           screen ambiguous about which event was being compared. */
        requests={[]}
        onSelectRequest={() => {}}
        isActing={isActing}
        onCancel={(id) => {
          void cancel(id)
            .unwrap()
            .then(() => navigate(MY_EVENTS_ROUTE))
            .catch(() => {
              /* mutation state surfaces the failure; stay on the event */
            });
        }}
        onOpenResponse={(quotationId) => navigate(responseRoute(detail.id, quotationId))}
        /* No `onBack`: the trail above already carries the one back control. */
        onLeave={() => navigate(MY_EVENTS_ROUTE)}
      />
    </>
  );
}
