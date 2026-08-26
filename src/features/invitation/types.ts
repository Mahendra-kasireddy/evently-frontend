/**
 * The guest invitation, shared by both sides of the approval loop.
 *
 * The organizer assembles it (P-15) and the customer reviews, personalizes and
 * signs it off from My Events. Both screens read the same `/invitation` payload,
 * so these types live here rather than in either feature — one definition, one
 * wire shape, no drift between the builder and the review screen.
 */

/** Who fills a section in: the organizer, or the customer on their own screen. */
export type BlockOwner = 'organizer' | 'customer';

/** Where the invitation sits in the organizer → customer approval loop. */
export type InvitationStatus = 'draft' | 'sent' | 'approved';

/** One section of the guest invitation — and one row of either screen. */
export interface InvitationBlock {
  key: string;
  title: string;
  /** Icon name from the API, resolved to a lucide glyph in `constants.ts`. */
  icon: string;
  owner: BlockOwner;
  hidden: boolean;
  /** Headline shown to guests; blank falls back to `title`. */
  heading: string;
  body: string;
}

/** Event-level details every section of the invitation draws from. */
export interface InvitationDetails {
  template: string;
  eyebrow: string;
  hostOne: string;
  hostTwo: string;
  joiner: string;
  /** `yyyy-mm-dd`. */
  eventDate: string;
  /** `HH:mm`. */
  eventTime: string;
  /** IANA zone the two fields above are expressed in, e.g. `Asia/Kolkata`. */
  timezone: string;
  /** Replaces the countdown once the event has started. */
  postEventMessage: string;
  venueName: string;
  venueAddress: string;
  message: string;
  rsvpEnabled: boolean;
  /** `yyyy-mm-dd`. */
  rsvpDeadline: string;
  rsvpPlusOnes: boolean;
}

/**
 * Who a Save-the-Date card is shown to.
 *
 * Two values only, mirroring the server enum. Targeting a card at named
 * invitees needs an invitee record, and the platform has none yet — no guest
 * list, no share link, no guest identity — so that value waits for the guest
 * surface rather than existing as a state nothing can honour.
 */
export type SubEventVisibility = 'all' | 'hidden';

/** One sub-event of the celebration, and one Save-the-Date card. */
export interface InvitationSubEvent {
  /** Server-assigned; stable across reorders, unlike an array index. */
  id: string;
  name: string;
  /** `yyyy-mm-dd`. */
  eventDate: string;
  /** `HH:mm`. */
  eventTime: string;
  /** `HH:mm`; blank means the default duration in the calendar entry. */
  endTime: string;
  timezone: string;
  venueName: string;
  venueAddress: string;
  dressCode: string;
  note: string;
  /** A `cardPalette` id, or '' to follow the invitation template. */
  colour: string;
  visibility: SubEventVisibility;
}

/** A card colour served by the API — a closed palette, not free-form hex. */
export interface CardColour {
  id: string;
  label: string;
  /** Card background. */
  wash: string;
  /** Text and rule colour legible on that wash. */
  ink: string;
}

/** A visual treatment for the guest invitation, served by the API. */
export interface InvitationTemplate {
  id: string;
  label: string;
  hero: string;
  wash: string;
  accent: string;
}

/**
 * A change the customer asked the organizer for on a section they don't own.
 * Stored on the invitation so the ask reaches the builder, not just a bell.
 */
export interface InvitationChangeRequest {
  id: string;
  /** Empty when the customer asked about the invitation as a whole. */
  blockKey: string;
  blockTitle: string;
  note: string;
  /** ISO timestamp. */
  at: string;
  resolved: boolean;
}

/**
 * `GET /invitation/organizer/:bookingId` and `GET /invitation/mine/:bookingId`
 * return the same document — the customer's copy simply 404s while it is still
 * a draft, so both screens can share this one shape.
 */
export interface Invitation {
  id: string;
  bookingId: string;
  bookingRef: string;
  bookingTitle: string;
  occasion: string;
  /** ISO timestamp from the booking. */
  eventDate: string;
  location: string;
  status: InvitationStatus;
  sentAt: string | null;
  approvedAt: string | null;
  details: InvitationDetails;
  blocks: InvitationBlock[];
  /** The Save-the-Date cards, in the order the organizer arranged them. */
  subEvents: InvitationSubEvent[];
  templates: InvitationTemplate[];
  /** Colours a card may be given. Server-owned, like `templates`. */
  cardPalette: CardColour[];
  /** Minutes a calendar entry runs for when a card has no end time. */
  defaultSubEventMinutes: number;
  changeRequests: InvitationChangeRequest[];
}
