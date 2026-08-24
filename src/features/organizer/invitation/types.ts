/**
 * Organizer-side invitation types.
 *
 * The document itself is shared with the customer's review screen, so its shape
 * lives in `@features/invitation`; only the builder's own view state is local.
 */
export type {
  BlockOwner,
  InvitationBlock,
  InvitationChangeRequest,
  InvitationDetails,
  InvitationStatus,
  InvitationTemplate,
} from '@features/invitation';

import type { Invitation, InvitationBlock, InvitationDetails } from '@features/invitation';

/** `GET /invitation/organizer/:bookingId`. */
export type OrganizerInvitation = Invitation;

/** Body of `PATCH /invitation/organizer/:bookingId`. */
export interface UpdateInvitationBody {
  details?: Partial<InvitationDetails>;
  blocks?: InvitationBlock[];
}

/** Which editor dialog is open: an existing section, a brand-new one, or none. */
export type EditorTarget = { kind: 'block'; key: string } | { kind: 'new' } | null;

export type { ApiBooking } from '@features/organizer/bookings/types';
