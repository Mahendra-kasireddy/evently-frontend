import {
  PencilLine,
  Clock,
  FileText,
  BadgeCheck,
  Calendar,
  CalendarCheck,
  Activity,
  CheckCircle2,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { CurrentEventData, CurrentEventStage } from '../../types';
import styles from './CurrentEvent.module.css';

/** Per-stage presentation for the compact widget: icon, status line, CTA text. */
const STAGE_UI: Record<
  CurrentEventStage,
  { icon: LucideIcon; status: string; cta: string; tone: 'plan' | 'quote' | 'booked' }
> = {
  draft: { icon: PencilLine, status: 'Draft in progress', cta: 'Continue Planning', tone: 'plan' },
  submitted: {
    icon: Clock,
    status: 'Waiting for organizer responses',
    cta: 'View Request',
    tone: 'plan',
  },
  quotes_received: {
    icon: FileText,
    status: 'Quotes ready to compare',
    cta: 'Compare Quotes',
    tone: 'quote',
  },
  quote_accepted: {
    icon: BadgeCheck,
    status: 'Quote accepted',
    cta: 'Continue Booking',
    tone: 'quote',
  },
  booking_created: {
    icon: Calendar,
    status: 'Booking placed — awaiting confirmation',
    cta: 'View Booking',
    tone: 'booked',
  },
  booking_confirmed: {
    icon: CalendarCheck,
    status: 'Booking confirmed',
    cta: 'View Booking',
    tone: 'booked',
  },
  in_progress: { icon: Activity, status: 'Event underway', cta: 'Track Event', tone: 'booked' },
  completed: {
    icon: CheckCircle2,
    status: 'Event completed',
    cta: 'View Summary',
    tone: 'booked',
  },
};

/**
 * Resolves the destination route for the stage's primary CTA.
 *
 * "Compare Quotes" goes to My Events rather than straight to a comparison. Home
 * surfaces one current event, but the customer may have several, and the bare
 * /quotes screen has to guess which request to open. My Events names every event
 * and lists the organizers who replied to each, so the customer picks the event
 * first and the organizers second — and the Compare button there carries the
 * request id, so nothing is guessed.
 */
function hrefFor(data: CurrentEventData): string {
  switch (data.stage) {
    case 'draft':
      return '/plan';
    case 'submitted':
      return '/workspace';
    case 'quotes_received':
      return '/workspace';
    case 'quote_accepted':
      return data.quotationId ? `/booking/${data.quotationId}` : '/workspace';
    case 'booking_created':
    case 'booking_confirmed':
    case 'in_progress':
    case 'completed':
      return `/booking-details/${data.refId}`;
    default:
      return '/workspace';
  }
}

/** Folds the most relevant fact into the status line, keeping the widget to one row. */
function statusText(data: CurrentEventData, base: string): string {
  if (data.stage === 'quotes_received' && data.quoteCount > 0) {
    return `${data.quoteCount} ${data.quoteCount === 1 ? 'quote' : 'quotes'} ready to compare`;
  }
  if (data.organizer && (data.stage === 'booking_confirmed' || data.stage === 'in_progress')) {
    return `${base} · ${data.organizer.name}`;
  }
  return base;
}

/**
 * Compact "Current Event" widget for the Home discovery dashboard. It is a
 * contextual shortcut — a single slim row that adapts its icon, status and CTA
 * to the active workflow stage — and never replaces the rest of Home.
 *
 * It renders nothing when there is no active event, or when the event has
 * completed (completed events live only in My Events / History). Data is
 * resolved by the backend Home BFF (feed.currentEvent); this is presentational.
 */
export function CurrentEvent({ data }: { data?: CurrentEventData | undefined }) {
  const navigate = useNavigate();
  // No active event, or a completed one — Home stays the plain discovery page.
  if (!data || data.stage === 'completed') return null;

  const ui = STAGE_UI[data.stage];
  const Icon = ui.icon;
  const href = hrefFor(data);
  const status = statusText(data, ui.status);

  return (
    <section
      className={styles.widget}
      data-tone={ui.tone}
      role="button"
      tabIndex={0}
      onClick={() => navigate(href)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(href);
        }
      }}
    >
      <span className={styles.icon}>
        <Icon size={18} strokeWidth={2.2} />
        {data.hasNewActivity && <span className={styles.dot} aria-label="New activity" />}
      </span>

      <span className={styles.text}>
        <span className={styles.eyebrow}>Current event</span>
        <span className={styles.title}>{data.title}</span>
      </span>

      <span className={styles.status}>{status}</span>

      {data.daysToGo != null && (
        <span className={styles.days}>
          {data.daysToGo}
          {data.daysToGo === 1 ? ' day' : ' days'} to go
        </span>
      )}

      <span className={styles.cta}>
        {ui.cta}
        <ArrowRight size={15} strokeWidth={2.4} />
      </span>
    </section>
  );
}
