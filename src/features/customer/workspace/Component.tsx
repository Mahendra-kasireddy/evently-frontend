import { useNavigate } from 'react-router-dom';
import { CalendarPlus } from 'lucide-react';
import { EmptyState } from '@shared/components';
import { WorkspaceHero, WorkspaceMain, WorkspaceSidebar, WorkspaceBookings } from './sections';
import type { PlanSubmission, PlanQuoteRequest, ApiBooking } from './types';
import styles from './styles.module.css';

export interface WorkspaceComponentProps {
  plans: PlanSubmission[];
  quotes: PlanQuoteRequest[];
  bookings: ApiBooking[];
}

export function Component({ plans, quotes, bookings }: WorkspaceComponentProps) {
  const navigate = useNavigate();

  const draftCount = plans.filter((p) => p.status === 'draft').length;
  const submittedCount = plans.length - draftCount;
  const isEmpty = plans.length === 0 && quotes.length === 0 && bookings.length === 0;

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
            <WorkspaceBookings bookings={bookings} onOpen={(id) => navigate(`/booking-details/${id}`)} />
            <div className={styles.grid}>
              <WorkspaceMain plans={plans} onResume={() => navigate('/plan')} onStartPlan={() => navigate('/plan')} />
              <WorkspaceSidebar quotes={quotes} onBrowseQuotes={() => navigate('/quotes')} />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
