import { useNavigate } from 'react-router-dom';
import { CalendarSearch, ChevronLeft, Clock } from 'lucide-react';
import { LoadingScreen, ErrorState, EmptyState } from '@shared/components';
import { useGetBookingQuery } from '@features/customer/booking/service';
import { bookedWorkspaceRoute, MY_EVENTS_ROUTE } from '../routes';
import { Component } from './Component';
import { INVITATION_COPY as COPY } from './constants';
import {
  useApproveMyInvitationMutation,
  useGetMyInvitationQuery,
  usePersonalizeInvitationBlockMutation,
  useRequestInvitationChangeMutation,
} from './service';
import styles from './styles.module.css';

/** A 404 here means "not shared yet", which is a state — not a failure. */
function isNotShared(error: unknown): boolean {
  return (error as { status?: number } | undefined)?.status === 404;
}

/**
 * My Events → booked event → guest invitation.
 *
 * Reached from the booked event's invitation card, and only ever for a booking
 * the caller owns — the API re-checks that, so a hand-edited booking id in the
 * URL gets a 403 from the server rather than someone else's invitation.
 */
export function InvitationContainer({ bookingId }: { bookingId: string }) {
  const navigate = useNavigate();
  const backToEvent = () => navigate(bookedWorkspaceRoute(bookingId));

  const booking = useGetBookingQuery(bookingId, { skip: !bookingId });
  // Same cache entry the workspace card reads, so both always agree.
  const invitation = useGetMyInvitationQuery(bookingId, { skip: !bookingId });

  const [approve, approveState] = useApproveMyInvitationMutation();
  const [personalize, personalizeState] = usePersonalizeInvitationBlockMutation();
  const [requestChange, requestState] = useRequestInvitationChangeMutation();

  if (booking.isLoading || invitation.isLoading) {
    return <LoadingScreen message={COPY.loading} />;
  }

  if (booking.isError || !booking.data) {
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

  /*
   * Still a draft on the organizer's side (or no invitation at all): the API
   * 404s that on purpose. Say so plainly and offer the way back — the rest of
   * the booked event is unaffected.
   */
  if (invitation.isError && isNotShared(invitation.error)) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <section className={styles.hero}>
            <span className={styles.blob} aria-hidden />
            <span className={styles.blob2} aria-hidden />
            <button
              type="button"
              className={styles.back}
              onClick={backToEvent}
              aria-label={COPY.back}
            >
              <ChevronLeft size={18} />
            </button>
            <div className={styles.heroText}>
              <span className={styles.eyebrow}>{COPY.eyebrowLead}</span>
              <h1 className={styles.heading}>{COPY.heading}</h1>
              <p className={styles.sub}>{booking.data.title}</p>
            </div>
          </section>
        </div>
        <div className={`${styles.container}`} style={{ paddingTop: 26 }}>
          <div className={styles.notice}>
            <span className={styles.noticeIcon}>
              <Clock size={24} />
            </span>
            <h2 className={styles.noticeTitle}>{COPY.preparingTitle}</h2>
            <p className={styles.noticeBody}>{COPY.preparingBody}</p>
            <button type="button" className={styles.primaryBtn} onClick={backToEvent}>
              {COPY.preparingAction}
            </button>
          </div>
        </div>
      </main>
    );
  }

  /* A real failure — retryable, and it never takes the event down with it. */
  if (invitation.isError || !invitation.data) {
    return (
      <div style={{ maxWidth: 720, margin: '48px auto', padding: '0 20px' }}>
        <ErrorState message={COPY.errorBody} onRetry={invitation.refetch} />
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
          <button type="button" className={styles.ghostBtn} onClick={backToEvent}>
            {COPY.preparingAction}
          </button>
        </div>
      </div>
    );
  }

  return (
    <Component
      invitation={invitation.data}
      organizerName={booking.data.organizer?.name ?? 'your organizer'}
      isApproving={approveState.isLoading}
      isSaving={personalizeState.isLoading}
      isRequesting={requestState.isLoading}
      onApprove={() => {
        void approve(bookingId);
      }}
      onPersonalize={(blockKey, patch) => {
        void personalize({ bookingId, blockKey, ...patch });
      }}
      onRequestChange={(note, blockKey) => {
        void requestChange(blockKey ? { bookingId, blockKey, note } : { bookingId, note });
      }}
      onBack={backToEvent}
    />
  );
}
