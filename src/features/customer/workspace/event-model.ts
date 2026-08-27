import type {
  ApiBooking,
  PlanQuoteRequest,
  PlanSubmission,
  QuoteResponse,
} from './types';
import { occasionLabel } from './label';
import { bookedWorkspaceRoute, eventRoute, invitationRoute, responseRoute } from './routes';

/**
 * ONE EVENT, ONE CARD.
 *
 * A single celebration is stored as up to three unrelated records — a plan
 * submission, a quote request, and a booking. My Events used to render each in
 * its own section, so the same naming ceremony appeared three times, under two
 * different names, with three different "open" buttons and nothing saying they
 * were the same thing. That is the confusion this module removes: the three
 * records are folded into one `WorkspaceEvent` with a single resolved stage.
 *
 * The join is real data, not a guess: a booking carries `requestId`, and a
 * request carries `planId`.
 */

/** The customer's journey, in order. Mirrors the backend CurrentEventStage. */
export type EventStage =
  | 'draft'
  | 'submitted'
  | 'quotes_received'
  | 'quote_accepted'
  | 'awaiting_organizer'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'closed';

/** The five milestones drawn on every card, and which stages have passed each. */
export const MILESTONES = ['Planned', 'Quoted', 'Booked', 'Confirmed', 'Delivered'] as const;

const STAGE_MILESTONE: Record<EventStage, number> = {
  draft: 0,
  submitted: 0,
  quotes_received: 1,
  quote_accepted: 1,
  awaiting_organizer: 2,
  confirmed: 3,
  in_progress: 3,
  completed: 4,
  closed: -1,
};

/** Ordering weight — furthest-along last, so a card can be sorted by progress. */
const STAGE_RANK: Record<EventStage, number> = {
  draft: 1,
  submitted: 2,
  quotes_received: 3,
  quote_accepted: 4,
  awaiting_organizer: 5,
  confirmed: 6,
  in_progress: 7,
  completed: 8,
  closed: 0,
};

export const STAGE_LABEL: Record<EventStage, string> = {
  draft: 'Draft',
  submitted: 'Awaiting quotes',
  quotes_received: 'Quotes received',
  quote_accepted: 'Quote accepted',
  awaiting_organizer: 'Advance paid · Awaiting organizer',
  confirmed: 'Organizer confirmed',
  in_progress: 'In progress',
  completed: 'Completed',
  closed: 'Closed',
};

/** Chip tone per stage — one vocabulary for the whole section. */
export const STAGE_TONE: Record<EventStage, 'neutral' | 'action' | 'waiting' | 'good' | 'closed'> = {
  draft: 'neutral',
  submitted: 'waiting',
  quotes_received: 'action',
  quote_accepted: 'action',
  awaiting_organizer: 'waiting',
  confirmed: 'good',
  in_progress: 'good',
  completed: 'neutral',
  closed: 'closed',
};

export interface EventAction {
  label: string;
  to: string;
}

/** What the guest invitation is doing, when the event has one at all. */
export type InvitationState = 'none' | 'awaiting-approval' | 'published';

export interface WorkspaceEvent {
  /** Stable key — the furthest-along record's id. */
  id: string;
  stage: EventStage;
  rank: number;
  /** How many of MILESTONES are done; -1 for a closed event. */
  milestone: number;
  title: string;
  occasion: string;
  /** ISO date when a booking fixed one, else the free-text the customer typed. */
  when: string;
  eventDate?: string | undefined;
  daysToGo: number | null;
  where: string;
  guests: string;
  reference: string | null;
  amount: number | null;
  organizerName: string | null;
  organizerInitials: string;
  organizerColor: string;
  /** One line naming what is happening, or what the customer must do. */
  statusLine: string;
  /** True when the event is blocked on the customer, not on anyone else. */
  needsYou: boolean;
  /** True once the event is over or dead. */
  past: boolean;
  primary: EventAction;
  secondary: EventAction | null;
  invitation: InvitationState;
  /** Organizer replies, when the event is still at the comparison stage. */
  responses: QuoteResponse[];
  plan: PlanSubmission | null;
  request: PlanQuoteRequest | null;
  booking: ApiBooking | null;
}

const BOOKING_STAGE: Record<ApiBooking['status'], EventStage> = {
  pending: 'quote_accepted',
  awaiting_organizer: 'awaiting_organizer',
  confirmed: 'confirmed',
  in_progress: 'in_progress',
  completed: 'completed',
  cancelled: 'closed',
  rejected: 'closed',
  expired: 'closed',
};

/** "5 Sept 2026" from an ISO date; '' when there isn't a usable one. */
function isoDateLabel(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** The event's name: occasion plus its date, so two weddings stay distinct. */
function titleFor(occasion: string, when: string): string {
  const name = occasionLabel(occasion);
  return when ? `${name} · ${when}` : name;
}

// ---------------------------------------------------------------------------
// Per-source builders
// ---------------------------------------------------------------------------

function fromBooking(
  booking: ApiBooking,
  request: PlanQuoteRequest | null,
  plan: PlanSubmission | null,
  invitation: InvitationState,
): WorkspaceEvent {
  const stage = BOOKING_STAGE[booking.status] ?? 'awaiting_organizer';
  const past = stage === 'closed' || stage === 'completed';
  const when = isoDateLabel(booking.eventDate) || request?.when || '';

  // Only one thing on a booked event is ever blocked on the customer: an
  // invitation the organizer has drafted and is waiting to have approved.
  // Everything else here is the organizer's move, so the card says "waiting".
  // An invitation the organizer has handed over is the one thing on a booked
  // event that is genuinely blocked on the customer, so it outranks the
  // organizer-side status line and moves the card into "Needs you".
  const needsApproval = !past && invitation === 'awaiting-approval';
  const statusLine = needsApproval
    ? 'Your guest invitation is ready — review and approve it.'
    : bookingStatusLine(booking, stage);

  const primary: EventAction = needsApproval
    ? { label: 'Review invitation', to: invitationRoute(booking.id) }
    : stage === 'closed'
      ? { label: 'View details', to: `/booking-details/${booking.id}` }
      : stage === 'awaiting_organizer' || stage === 'quote_accepted'
        ? { label: 'View booking', to: `/booking-details/${booking.id}` }
        : { label: 'Open event workspace', to: bookedWorkspaceRoute(booking.id) };

  return {
    id: booking.id,
    stage,
    rank: STAGE_RANK[stage],
    milestone: STAGE_MILESTONE[stage],
    title: booking.title || titleFor(booking.occasion, when),
    occasion: booking.occasion || request?.occasion || plan?.occasion || '',
    when,
    eventDate: booking.eventDate,
    daysToGo: typeof booking.daysToGo === 'number' ? booking.daysToGo : null,
    where: booking.location || request?.where || '',
    guests: request?.guests || plan?.guests || '',
    reference: booking.ref,
    amount: booking.amount,
    organizerName: booking.organizer?.name ?? null,
    organizerInitials: booking.organizer?.initials ?? '★',
    organizerColor: booking.organizer?.avatarColor ?? '#7c5bd6',
    statusLine,
    needsYou: needsApproval,
    past,
    primary,
    secondary: needsApproval
      ? { label: 'Open event workspace', to: bookedWorkspaceRoute(booking.id) }
      : (stage === 'confirmed' || stage === 'in_progress') && invitation !== 'none'
        ? { label: invitation === 'published' ? 'Guest invitation' : 'Review invitation', to: invitationRoute(booking.id) }
        : null,
    invitation,
    responses: [],
    plan,
    request,
    booking,
  };
}

function bookingStatusLine(booking: ApiBooking, stage: EventStage): string {
  const org = booking.organizer?.name ?? 'Your organizer';
  switch (stage) {
    case 'quote_accepted':
      return 'Booking placed — finish your advance payment.';
    case 'awaiting_organizer':
      return `Advance paid. Waiting for ${org} to accept.`;
    case 'confirmed':
      return `${org} confirmed. Plan the details in your workspace.`;
    case 'in_progress':
      return `${org} is delivering your event.`;
    case 'completed':
      return 'Event delivered.';
    default:
      return booking.status === 'rejected'
        ? `${org} declined this booking.`
        : booking.status === 'expired'
          ? `${org} did not respond in time.`
          : 'This booking was cancelled.';
  }
}

function fromRequest(request: PlanQuoteRequest, plan: PlanSubmission | null): WorkspaceEvent {
  const responses = request.responses ?? [];
  const accepted = responses.find((r) => r.status === 'accepted');
  const closed = request.status === 'cancelled' || request.status === 'closed';

  const stage: EventStage = closed
    ? 'closed'
    : accepted
      ? 'quote_accepted'
      : responses.length > 0
        ? 'quotes_received'
        : 'submitted';

  // Quotes sitting unread are the clearest "your move" state in the product.
  const needsYou = stage === 'quotes_received';

  const statusLine = closed
    ? request.status === 'cancelled'
      ? 'You cancelled this request.'
      : 'This request is closed.'
    : accepted
      ? 'You accepted a quote — complete the booking to lock your date.'
      : responses.length > 0
        ? `${responses.length} ${responses.length === 1 ? 'organizer has' : 'organizers have'} replied. Compare and choose.`
        : request.organizer?.name
          ? `Waiting for ${request.organizer.name} to reply.`
          : 'Waiting for organizers to reply.';

  const primary: EventAction = accepted
    ? { label: 'View accepted quote', to: responseRoute(request.id, accepted.quotationId) }
    : responses.length > 1
      ? { label: `Compare ${responses.length} quotes`, to: eventRoute(request.id) }
      : responses.length === 1 && responses[0]
        ? { label: 'Review the quote', to: responseRoute(request.id, responses[0].quotationId) }
        : { label: 'View request', to: eventRoute(request.id) };

  const cheapest = responses
    .filter((r) => r.grandTotal > 0)
    .reduce<number | null>((min, r) => (min === null || r.grandTotal < min ? r.grandTotal : min), null);

  return {
    id: request.id,
    stage,
    rank: STAGE_RANK[stage],
    milestone: STAGE_MILESTONE[stage],
    title: titleFor(request.occasion, request.when),
    occasion: request.occasion,
    when: request.when,
    eventDate: undefined,
    daysToGo: null,
    where: request.where,
    guests: request.guests,
    reference: plan?.planCode ?? null,
    amount: cheapest,
    organizerName: request.organizer?.name ?? null,
    organizerInitials: request.organizer?.initials ?? '★',
    organizerColor: request.organizer?.avatarColor ?? '#7c5bd6',
    statusLine,
    needsYou,
    past: closed,
    primary,
    secondary: null,
    invitation: 'none',
    responses,
    plan,
    request,
    booking: null,
  };
}

function fromPlan(plan: PlanSubmission): WorkspaceEvent {
  const isDraft = plan.status === 'draft';
  const closed = plan.status === 'cancelled';
  const stage: EventStage = closed ? 'closed' : isDraft ? 'draft' : 'submitted';
  const when = isoDateLabel(plan.eventDate);

  return {
    id: plan.id,
    stage,
    rank: STAGE_RANK[stage],
    milestone: STAGE_MILESTONE[stage],
    title: titleFor(plan.occasion, when),
    occasion: plan.occasion,
    when,
    eventDate: plan.eventDate,
    daysToGo: null,
    where: [plan.area, plan.city].filter(Boolean).join(', '),
    guests: plan.guests,
    reference: plan.planCode ?? null,
    amount: null,
    organizerName: null,
    organizerInitials: '★',
    organizerColor: '#7c5bd6',
    statusLine: closed
      ? 'This plan was cancelled.'
      : isDraft
        ? 'Draft — finish it to get quotes from organizers.'
        : 'Submitted. Waiting for organizers to reply.',
    // An unfinished draft is entirely the customer's move.
    needsYou: isDraft,
    past: closed,
    primary: isDraft
      ? { label: 'Finish this plan', to: `/plan?plan=${encodeURIComponent(plan.id)}` }
      : { label: 'Edit & resend', to: `/plan?plan=${encodeURIComponent(plan.id)}` },
    secondary: null,
    invitation: 'none',
    responses: [],
    plan,
    request: null,
    booking: null,
  };
}

// ---------------------------------------------------------------------------
// The fold
// ---------------------------------------------------------------------------

/**
 * Collapse the three record types into one list of events.
 *
 * Bookings win, then requests, then plans: each record is claimed by the
 * furthest-along thing that references it, so a plan whose booking exists is
 * shown once — as a booking — and never again as a stray "Submitted" plan.
 */
export function buildEvents(
  plans: PlanSubmission[],
  requests: PlanQuoteRequest[],
  bookings: ApiBooking[],
  invitations: ReadonlyMap<string, InvitationState> = new Map(),
): WorkspaceEvent[] {
  const requestById = new Map(requests.map((r) => [r.id, r]));
  const planById = new Map(plans.map((p) => [p.id, p]));
  const usedRequests = new Set<string>();
  const usedPlans = new Set<string>();

  const events: WorkspaceEvent[] = [];

  for (const booking of bookings) {
    const request = booking.requestId ? (requestById.get(booking.requestId) ?? null) : null;
    const plan = request?.planId ? (planById.get(request.planId) ?? null) : null;
    if (request) usedRequests.add(request.id);
    if (plan) usedPlans.add(plan.id);
    events.push(
      fromBooking(booking, request, plan, invitations.get(booking.id) ?? 'none'),
    );
  }

  for (const request of requests) {
    if (usedRequests.has(request.id)) continue;
    const plan = request.planId ? (planById.get(request.planId) ?? null) : null;
    if (plan) usedPlans.add(plan.id);
    events.push(fromRequest(request, plan));
  }

  for (const plan of plans) {
    if (usedPlans.has(plan.id)) continue;
    // A plan the customer already turned into a request but whose request
    // predates the plan link still shows up here; that is correct — it is the
    // only record we can prove exists.
    events.push(fromPlan(plan));
  }

  return sortEvents(events);
}

/**
 * Soonest first among live events; anything finished or dead sinks to the
 * bottom. Events with no date yet sit after dated ones but before the past.
 */
function sortEvents(events: WorkspaceEvent[]): WorkspaceEvent[] {
  return [...events].sort((a, b) => {
    if (a.past !== b.past) return a.past ? 1 : -1;
    if (a.needsYou !== b.needsYou) return a.needsYou ? -1 : 1;
    const days = (e: WorkspaceEvent) =>
      typeof e.daysToGo === 'number' && e.daysToGo >= 0 ? e.daysToGo : Number.POSITIVE_INFINITY;
    const byDate = days(a) - days(b);
    if (byDate !== 0) return byDate;
    return b.rank - a.rank;
  });
}

export type EventTab = 'needs-you' | 'upcoming' | 'past';

/** Which tab an event belongs to. Every event lands in exactly one. */
export function tabFor(event: WorkspaceEvent): EventTab {
  if (event.past) return 'past';
  return event.needsYou ? 'needs-you' : 'upcoming';
}
