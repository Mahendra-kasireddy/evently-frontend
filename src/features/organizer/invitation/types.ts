/**
 * Organizer-side invitation types.
 *
 * The document itself is shared with the customer's review screen, so its shape
 * lives in `@features/invitation`; only the builder's own view state is local.
 */
export type {
  BlockOwner,
  CardColour,
  GuestGroupId,
  InvitationBlock,
  InvitationStoryCard,
  InvitationChangeRequest,
  InvitationDetails,
  InvitationStatus,
  InvitationSubEvent,
  InvitationTemplate,
  SubEventVisibility,
} from '@features/invitation';

import type {
  Invitation,
  InvitationBlock,
  InvitationDetails,
  InvitationSubEvent,
} from '@features/invitation';

/** `GET /invitation/organizer/:bookingId`. */
export type OrganizerInvitation = Invitation;

/** Body of `PATCH /invitation/organizer/:bookingId`. */
export interface UpdateInvitationBody {
  details?: Partial<InvitationDetails>;
  blocks?: InvitationBlock[];
  /** Replaces the whole list; array order is the guest-facing order. */
  subEvents?: InvitationSubEvent[];
  /** Replaces the whole story; array order is the order guests read it in. */
  storyCards?: StoryCardInput[];
}

/**
 * A story card on the way to the server.
 *
 * Without `id` or `order`: the id is the server's, and the order is the array's
 * — sending a number the client made up would be inviting the two to disagree.
 */
export interface StoryCardInput {
  imageUrl: string;
  imageKey?: string;
  caption: string;
}

/** Which editor dialog is open: an existing section, a brand-new one, or none. */
export type EditorTarget =
  | { kind: 'block'; key: string }
  | { kind: 'new' }
  | null;

export type { ApiBooking } from '@features/organizer/bookings/types';
