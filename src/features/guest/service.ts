import { apiClient } from '@lib/api';
import { baseApi, toQueryResult } from '@lib/rtk';
import type {
  CardColour,
  InvitationBlock,
  InvitationDetails,
  InvitationSubEvent,
  InvitationTemplate,
} from '@features/invitation';

/**
 * The published invitation, as a guest holding a share link sees it.
 *
 * A deliberately smaller shape than `Invitation`: no status, no change
 * requests, no ownership, no booking id. The server builds this payload
 * separately for the same reason — a field added to the customer's view later
 * must not become guest-visible by accident.
 */
export interface GuestInvitation {
  guest: { name: string };
  bookingTitle: string;
  occasion: string;
  details: InvitationDetails;
  /** Already filtered: hidden sections never reach a guest. */
  blocks: InvitationBlock[];
  subEvents: InvitationSubEvent[];
  templates: InvitationTemplate[];
  cardPalette: CardColour[];
  defaultSubEventMinutes: number;
}

export const guestInvitationApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /**
     * No auth header is needed and none is required — the token in the path is
     * the credential. The shared axios client attaches a bearer token when the
     * viewer happens to be signed in, which the endpoint simply ignores.
     */
    getSharedInvitation: build.query<GuestInvitation, string>({
      queryFn: (token) =>
        toQueryResult(
          async () =>
            (
              await apiClient.get<GuestInvitation>(
                `/invitation/shared/${encodeURIComponent(token)}`,
              )
            ).data,
        ),
    }),
  }),
});

export const { useGetSharedInvitationQuery } = guestInvitationApi;
