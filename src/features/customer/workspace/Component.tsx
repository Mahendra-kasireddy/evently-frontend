import { useNavigate } from 'react-router-dom';
import { CalendarPlus } from 'lucide-react';
import { EmptyState } from '@shared/components';
import { WorkspaceHero, WorkspaceMain, WorkspaceResponses, WorkspaceBookings } from './sections';
import { bookedWorkspaceRoute, eventRoute, responseRoute } from './routes';
import type { PlanSubmission, PlanQuoteRequest, ApiBooking } from './types';
import styles from './styles.module.css';

export interface WorkspaceComponentProps {
  plans: PlanSubmission[];
  quotes: PlanQuoteRequest[];
  bookings: ApiBooking[];
}

/**
 * My Events — the customer's central workspace, ordered by how much each block
 * is waiting on them:
 *
 *   1. Booked events        — already committed, needs managing
 *   2. Organizer responses  — a decision is outstanding
 *   3. Plans & history      — drafts to resume, past submissions
 *
 * Organizer responses sits full width (it was previously a cramped right-rail
 * "Quote status" list) because choosing between organizers is the decision this
 * screen exists to support. Its per-event action carries the request id, so
 * "Compare" always opens the comparison for the event the customer was looking
 * at rather than whichever request a default heuristic picked.
 */
export function Component({ plans, quotes, bookings }: WorkspaceComponentProps) {
  const navigate = useNavigate();

  const draftCount = plans.filter((p) => p.status === 'draft').length;
  const submittedCount = plans.length - draftCount;
  const isEmpty = plans.length === 0 && quotes.length === 0 && bookings.length === 0;

  // Both steps stay under /workspace, so the nav item stays on My Events and the
  // URL keeps telling the customer which section — and which event — they are in.
  const openEvent = (requestId: string) => navigate(eventRoute(requestId));
  const openResponse = (requestId: string, quotationId: string) =>
    navigate(responseRoute(requestId, quotationId));

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <WorkspaceHero
          total={plans.length}
          draftCount={draftCount}
          submittedCount={submittedCount}
          quoteCount={quotes.length}
          onStartPlan={() => navigate('/plan')}
        />

        {isEmpty ? (
          <EmptyState
            icon={CalendarPlus}
            title="No events yet"
            message="Start planning your first celebration — tell us the occasion and get tailored quotes from verified organizers within a day."
            actionLabel="Plan an event"
            onAction={() => navigate('/plan')}
          />
        ) : (
          <>
            {/* A booked event opens its workspace inside My Events, rather than
                the standalone booking-details screen outside the section. */}
            <WorkspaceBookings bookings={bookings} onOpen={(id) => navigate(bookedWorkspaceRoute(id))} />
            <WorkspaceResponses
              requests={quotes}
              onOpenEvent={openEvent}
              onOpenResponse={openResponse}
            />
            <WorkspaceMain
              plans={plans}
              onResume={() => navigate('/plan')}
              onStartPlan={() => navigate('/plan')}
            />
          </>
        )}
      </div>
    </main>
  );
}
