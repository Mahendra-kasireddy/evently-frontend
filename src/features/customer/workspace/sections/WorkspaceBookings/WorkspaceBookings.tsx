import { CalendarCheck, CalendarDays, Clock, MapPin, Send, Sparkles } from 'lucide-react';
import { formatINR } from '@features/customer/quotes/transform';
import { useGetMyInvitationQuery } from '../../invitation/service';
import type { ApiBooking, BookingStatus } from '@features/customer/booking/types';
import styles from './WorkspaceBookings.module.css';

const STATUS: Record<BookingStatus, { label: string; cls: string }> = {
  pending: { label: 'Pending', cls: 'pending' },
  confirmed: { label: 'Confirmed', cls: 'confirmed' },
  in_progress: { label: 'In progress', cls: 'progress' },
  completed: { label: 'Completed', cls: 'completed' },
  cancelled: { label: 'Cancelled', cls: 'cancelled' },
  rejected: { label: 'Rejected', cls: 'rejected' },
};

/** Bookings that are over, or never happened — kept, but visually secondary. */
const PAST: BookingStatus[] = ['completed', 'cancelled', 'rejected'];

export interface WorkspaceBookingsProps {
  bookings: ApiBooking[];
  onOpen: (id: string) => void;
  onOpenInvitation: (id: string) => void;
}

/** `2026-08-18T…` → `Tue, 18 Aug 2026`; anything unparseable → ''. */
function dateLabel(iso: string | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * The countdown, from the `daysToGo` the API already computes — not recomputed
 * here, so this screen can never disagree with the booked-event workspace about
 * how far away the same event is.
 */
function countdown(booking: ApiBooking): string {
  if (PAST.includes(booking.status)) return '';
  const days = booking.daysToGo;
  if (typeof days !== 'number' || Number.isNaN(days)) return '';
  if (days < 0) return '';
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `In ${days} days`;
}

/**
 * The one thing this event is waiting on, from its real status. No invented
 * states: every branch here maps to a `BookingStatus` the backend sends.
 */
function primaryAction(status: BookingStatus): string {
  if (status === 'pending') return 'Review booking';
  if (status === 'completed') return 'View event';
  if (status === 'cancelled' || status === 'rejected') return 'View details';
  return 'Open workspace';
}

interface BookingCardProps {
  booking: ApiBooking;
  /** The nearest upcoming event gets the prominent treatment. */
  featured: boolean;
  onOpen: (id: string) => void;
  onOpenInvitation: (id: string) => void;
}

function BookingCard({ booking, featured, onOpen, onOpenInvitation }: BookingCardProps) {
  /*
   * The same cache entry the booked-event workspace and its invitation screen
   * already read, so this costs no extra request once either has been opened —
   * and the two surfaces can never show different invitation states.
   *
   * A 404 is the normal "organizer is still drafting it" case, not a failure.
   */
  const invitation = useGetMyInvitationQuery(booking.id, { skip: !booking.id });
  const status = invitation.data?.status;

  const s = STATUS[booking.status] ?? { label: booking.status || 'Unknown', cls: 'pending' };
  const past = PAST.includes(booking.status);
  const when = dateLabel(booking.eventDate);
  const soon = countdown(booking);

  return (
    <article
      className={`${styles.card} ${featured ? styles.cardFeatured : ''} ${past ? styles.cardPast : ''}`}
    >
      <div className={styles.cardMain}>
        <span
          className={styles.avatar}
          style={{ backgroundColor: booking.organizer?.avatarColor ?? '#7c5bd6' }}
          aria-hidden
        >
          {booking.organizer?.initials ?? '★'}
        </span>

        <div className={styles.body}>
          <div className={styles.titleRow}>
            <h4 className={styles.title}>{booking.title}</h4>
            <span className={`${styles.badge} ${styles[s.cls]}`}>{s.label}</span>
          </div>

          {booking.occasion && <span className={styles.occasion}>{booking.occasion}</span>}

          <div className={styles.facts}>
            {when && (
              <span className={styles.fact}>
                <CalendarDays size={13} /> {when}
              </span>
            )}
            {booking.location && (
              <span className={styles.fact}>
                <MapPin size={13} /> {booking.location}
              </span>
            )}
            {soon && (
              <span className={styles.countdown}>
                <Clock size={13} /> {soon}
              </span>
            )}
          </div>

          <span className={styles.meta}>
            {booking.ref} · {booking.organizer?.name ?? 'Organizer'}
          </span>
        </div>

        <div className={styles.right}>
          <span className={styles.amount}>{formatINR(booking.amount)}</span>
          <button type="button" className={styles.primaryBtn} onClick={() => onOpen(booking.id)}>
            {primaryAction(booking.status)}
          </button>
        </div>
      </div>

      {/*
        The invitation row appears only once there is something real to say
        about it — while the query is loading, or when it 404s because the
        organizer has not shared a draft yet, there is no status to report.
      */}
      {status && (
        <div className={styles.invite}>
          <span className={styles.inviteLabel}>
            <Sparkles size={13} />
            Guest invitation
            <span
              className={`${styles.inviteState} ${
                status === 'approved' ? styles.invitePublished : styles.inviteDraft
              }`}
            >
              {status === 'approved' ? 'Published' : 'Awaiting your approval'}
            </span>
          </span>

          <span className={styles.inviteActions}>
            <button
              type="button"
              className={styles.linkBtn}
              onClick={() => onOpenInvitation(booking.id)}
            >
              {status === 'approved' ? 'View invitation' : 'Review invitation'}
            </button>
            {status === 'approved' && (
              <button
                type="button"
                className={styles.shareBtn}
                onClick={() => onOpenInvitation(booking.id)}
              >
                <Send size={13} /> Share invitation
              </button>
            )}
          </span>
        </div>
      )}
    </article>
  );
}

/**
 * The customer's booked events.
 *
 * The nearest upcoming one is given the prominent card because it is the thing
 * they came here to check; finished and cancelled events keep their place in
 * the list but recede.
 */
export function WorkspaceBookings({ bookings, onOpen, onOpenInvitation }: WorkspaceBookingsProps) {
  if (bookings.length === 0) return null;

  // The featured card is the first upcoming one in the order the caller sorted,
  // so the choice follows that single sort rather than a second opinion here.
  const featuredId = bookings.find((b) => !PAST.includes(b.status))?.id ?? '';

  return (
    <section className={styles.block}>
      <h3 className={styles.head}>
        <CalendarCheck size={17} /> My bookings
      </h3>
      <div className={styles.list}>
        {bookings.map((b) => (
          <BookingCard
            key={b.id}
            booking={b}
            featured={b.id === featuredId && bookings.length > 1}
            onOpen={onOpen}
            onOpenInvitation={onOpenInvitation}
          />
        ))}
      </div>
    </section>
  );
}
