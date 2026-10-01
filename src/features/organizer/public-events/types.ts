/**
 * The organizer's view of a public event.
 *
 * These mirror what `/public-event/organizer/*` actually returns. Nothing here
 * is invented for the UI's convenience: a field the screens want and the API
 * does not send belongs in the API, not in a default somewhere in a reducer.
 */

export type PublicEventStatus =
  | 'draft'
  | 'published'
  | 'sold_out'
  | 'completed'
  | 'cancelled';

export type TicketTypeStatus = 'active' | 'paused';
export type LiveAccess = 'free' | 'ticketed';
export type LiveState = 'upcoming' | 'live' | 'ended';
export type MemoryUploaders = 'checked_in' | 'ticket_holders' | 'nobody';
export type CheckInResult = 'entry_allowed' | 'already_checked_in' | 'invalid_ticket';

export interface EventVenue {
  name: string;
  address: string;
  city: string;
  state: string;
  latitude: number | null;
  longitude: number | null;
}

export interface EventMemoriesSettings {
  enabled: boolean;
  uploaders: MemoryUploaders;
  attendeeView: boolean;
  attendeeDownload: boolean;
  moderation: boolean;
  uploadWindowDays: number;
}

export interface EventLiveSettings {
  enabled: boolean;
  access: LiveAccess;
  url: string;
  startsAt: string | null;
  endsAt: string | null;
  replayEnabled: boolean;
}

export interface PublicEvent {
  id: string;
  title: string;
  category: string;
  description: string;
  coverUrl: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  startDateTime: string;
  endDateTime: string | null;
  timezone: string;
  venue: EventVenue;
  capacity: number;
  maxPerCustomer: number;
  status: PublicEventStatus;
  publishedAt: string | null;
  cancelledAt: string | null;
  cancelReason: string;
  memories: EventMemoriesSettings;
  liveStream: EventLiveSettings;
}

/** A row in the organizer's list: the event, plus the numbers on its card. */
export interface PublicEventSummary extends PublicEvent {
  ticketTypeCount: number;
  capacity: number;
  sold: number;
  remaining: number;
  startingPrice: number;
}

export interface TicketType {
  id: string;
  name: string;
  description: string;
  price: number;
  totalQuantity: number;
  availableQuantity: number;
  salesStart: string | null;
  salesEnd: string | null;
  maxPerCustomer: number;
  status: TicketTypeStatus;
  archived: boolean;
  sold: number;
  onSale: boolean;
}

export interface EventDashboard {
  eventId: string;
  status: PublicEventStatus;
  ticketsSold: number;
  ticketsRemaining: number;
  capacity: number;
  bookings: number;
  revenue: number;
  checkedIn: number;
  pendingEntry: number;
  liveState: LiveState;
  memoriesEnabled: boolean;
  liveStreamEnabled: boolean;
  byTicketType: Array<{
    id: string;
    name: string;
    price: number;
    total: number;
    remaining: number;
    sold: number;
  }>;
}

export interface Attendee {
  ticketId: string;
  code: string;
  status: 'valid' | 'checked_in' | 'cancelled' | 'refunded';
  checkedInAt: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  ticketTypeName: string;
  bookingId: string;
  bookingReference: string;
  bookingStatus: string;
  paymentStatus: string;
  amount: number;
  bookedAt: string | null;
}

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface CheckInOutcome {
  result: CheckInResult;
  reason?: string;
  ticket?: {
    ticketId: string;
    code: string;
    status: string;
    checkedInAt: string | null;
    customerName: string;
    ticketTypeName: string;
  };
}

/**
 * What the create/edit form submits. Dates go as ISO strings.
 *
 * The optional fields are written `?: T | undefined` rather than just `?: T`
 * because this project compiles with `exactOptionalPropertyTypes`: a form
 * field the organizer left blank really is present-and-undefined, and the
 * alternative is building these objects out of conditional spreads, which
 * hides which fields exist behind a wall of `...(x ? {x} : {})`.
 */
export interface PublicEventInput {
  title: string;
  category?: string | undefined;
  description?: string | undefined;
  coverUrl?: string | undefined;
  contactName?: string | undefined;
  contactPhone?: string | undefined;
  contactEmail?: string | undefined;
  startDateTime: string;
  endDateTime?: string | undefined;
  timezone?: string | undefined;
  venue?: Partial<EventVenue> | undefined;
  capacity?: number | undefined;
  maxPerCustomer?: number | undefined;
}

export interface TicketTypeInput {
  name: string;
  description?: string | undefined;
  price: number;
  totalQuantity: number;
  salesStart?: string | undefined;
  salesEnd?: string | undefined;
  maxPerCustomer?: number | undefined;
  status?: TicketTypeStatus | undefined;
}

/** The query arguments the list and the attendee table send. */
export interface PublicEventListArgs {
  status?: PublicEventStatus | undefined;
  q?: string | undefined;
}

export interface AttendeeListArgs {
  eventId: string;
  checkIn?: 'all' | 'checked_in' | 'pending' | undefined;
  q?: string | undefined;
}

export interface StatusChangeArgs {
  eventId: string;
  status: PublicEventStatus;
  reason?: string | undefined;
}
