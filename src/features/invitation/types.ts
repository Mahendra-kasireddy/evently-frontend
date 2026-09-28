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
  /** What the story section is called, e.g. "Our Journey". */
  storyTitle?: string;
  /* ---- the countdown, and the notice it raises ---- */
  /** Which sub-event the countdown points at; '' is the invitation's date. */
  countdownSubEventId?: string;
  oneDayNotificationEnabled?: boolean;
  oneDayNotificationMessage?: string;
  /** What the notice says instead to a guest who opens it after the day. */
  missedNotificationMessage?: string;
  /* ---- the invitation the organizer uploaded ---- */
  /**
   * What the organizer uploaded, if anything. '' means nothing yet.
   *
   * An invitation is a design — made in whatever the organizer already designs
   * in — so the platform stores the finished artwork rather than trying to
   * rebuild it out of form fields.
   */
  heroMediaType?: '' | 'image' | 'video';
  heroMediaUrl?: string;
  /** Storage handle, for replacing or deleting. Never sent to a guest. */
  heroMediaKey?: string;
  /** A video's length in seconds, as the uploading client measured it. */
  heroMediaDurationSec?: number;
  rsvpEnabled: boolean;
  /** `yyyy-mm-dd`. */
  rsvpDeadline: string;
  rsvpPlusOnes: boolean;
}

/**
 * What the countdown counts down to, as the guest API resolves it.
 *
 * `startsAt` is one absolute instant, already resolved from the event's own
 * wall-clock date, time and zone — the client subtracts and never interprets.
 */
export interface GuestCountdown {
  subEventId: string;
  name: string;
  /** ISO instant, or null when the event has no date yet. */
  startsAt: string | null;
  timezone: string;
  venueName: string;
  venueAddress: string;
  postEventMessage: string;
}

/** Whether to raise the day-before notice with this guest. Decided server-side. */
export type GuestNotification =
  | { show: false }
  | {
      show: true;
      kind: string;
      /**
       * `upcoming` before the event, `missed` for a guest arriving after it,
       * and `live` for the "it has started" card F5 raises.
       */
      state: 'upcoming' | 'missed' | 'live';
      message: string;
      /** Live only: which event, so the card can scroll the guest to it. */
      subEventId?: string;
      name?: string;
    };

/** One photograph in the couple's story, and the line that goes under it. */
export interface InvitationStoryCard {
  /** Server-assigned; stable across reorders, unlike an array index. */
  id: string;
  imageUrl: string;
  /** Storage handle. Present for the organizer and customer, never a guest. */
  imageKey?: string;
  caption: string;
  /** The organizer's arrangement, stored rather than inferred from position. */
  order: number;
}

/**
 * Who a Save-the-Date card is shown to.
 *
 * Two values only, mirroring the server enum. Targeting a card at named
 * invitees needs an invitee record, and the platform has none yet — no guest
 * list, no share link, no guest identity — so that value waits for the guest
 * surface rather than existing as a state nothing can honour.
 */
export type SubEventVisibility = 'all' | 'groups' | 'hidden';

/** The groups the guest list already files people under. */
export type GuestGroupId = 'family' | 'friends' | 'work' | 'other';

/** The targeting options, named for the organizer. Server-owned ids. */
export const GUEST_GROUPS: Array<{ id: GuestGroupId; label: string }> = [
  { id: 'family', label: 'Family' },
  { id: 'friends', label: 'Friends' },
  { id: 'work', label: 'Work' },
  { id: 'other', label: 'Everyone else' },
];

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
  /**
   * Which guest groups a targeted card is for; only meaningful when
   * `visibility` is `groups`. Never sent to a guest — who else was invited is
   * the organizer's business.
   */
  groups?: GuestGroupId[];

  /* ---- F5: this event's live stream ----
   *
   * On the sub-event because "live" belongs to one ceremony, and because the
   * guests who may watch are exactly the guests invited to it — `visibility`
   * and `groups` above already say who that is.
   */
  /** The organizer's switch. Off means no guest is shown anything. */
  liveEnabled?: boolean;
  /** The line over the player, e.g. "Watch the Ceremony Live". */
  liveTitle?: string;
  /** Embed url. The server only accepts https players on its own allowlist. */
  liveUrl?: string;
  /** Optional alternates; a mode with no url is never offered to a guest. */
  live360Url?: string;
  liveVrUrl?: string;
  /** ISO instant the switch went on. Server-owned — read-only to the builder. */
  liveStartedAt?: string;
}

/** One way of watching, named for the control the guest taps. */
export type LiveModeId = 'standard' | '360' | 'vr';

export interface LiveStreamMode {
  id: LiveModeId;
  url: string;
}

/**
 * The stream a guest may watch, or null.
 *
 * Decided on the server from the guest's own group: a guest not invited to the
 * ceremony is handed null, not a hidden section.
 */
export interface GuestLive {
  subEventId: string;
  name: string;
  title: string;
  /** Always at least one; `modes[0]` is what plays first. */
  modes: LiveStreamMode[];
  startedAt: string;
  venueName: string;
  venueAddress: string;
  eventDate: string;
  eventTime: string;
  timezone: string;
  dressCode: string;
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
  /** The story, in the organizer's order. Empty means there is no story. */
  storyCards: InvitationStoryCard[];
  templates: InvitationTemplate[];
  /** Colours a card may be given. Server-owned, like `templates`. */
  cardPalette: CardColour[];
  /** Minutes a calendar entry runs for when a card has no end time. */
  defaultSubEventMinutes: number;
  changeRequests: InvitationChangeRequest[];
}
