import { apiClient } from '@lib/api';
import { baseApi, toQueryResult } from '@lib/rtk';
import type {
  CardColour,
  GuestCountdown,
  GuestLive,
  GuestNotification,
  InvitationBlock,
  InvitationDetails,
  InvitationStoryCard,
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
  /** The story, in order. Never carries the storage handles. */
  storyCards: InvitationStoryCard[];
  templates: InvitationTemplate[];
  cardPalette: CardColour[];
  defaultSubEventMinutes: number;
  /** What the countdown counts down to. Absent when no date is set anywhere. */
  countdown?: GuestCountdown | null;
  /** Whether to raise a notice with this guest — day-before, or live. */
  notification?: GuestNotification;
  /**
   * The stream this guest may watch, or null.
   *
   * Null covers both "nothing is streaming" and "this guest is not invited to
   * the event that is" — deliberately indistinguishable from out here.
   */
  live?: GuestLive | null;
}

export const guestInvitationApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /**
     * No auth header is needed and none is required — the token in the path is
     * the credential. The shared axios client attaches a bearer token when the
     * viewer happens to be signed in, which the endpoint simply ignores.
     */
    /**
     * A guest saying they have read the day-before notice.
     *
     * The token is the whole request — which guest, which invitation and which
     * event are all resolved from it on the server, so nothing about this call
     * can reach another guest's record. Recorded there rather than in the
     * browser, because the dismissal has to survive a new browser and a
     * different device.
     */
    dismissGuestNotification: build.mutation<
      { dismissed: true },
      { token: string; kind?: string }
    >({
      queryFn: ({ token, kind }) =>
        toQueryResult(
          async () =>
            (
              await apiClient.post<{ dismissed: true }>(
                `/invitation/shared/${encodeURIComponent(token)}/notification/dismiss`,
                /* Which notice, never which event: the server resolves what it
                   was about from the token. */
                kind ? { kind } : {},
              )
            ).data,
        ),
    }),
    /**
     * A guest saying they still have the stream open, and being told how many
     * others do.
     *
     * A heartbeat and not a socket. The token is the whole request: which
     * event is being watched, and whether this guest may watch it, are both
     * resolved on the server — and the answer is a count, never a list, so
     * one guest cannot learn who else is there.
     */
    pingGuestLive: build.mutation<{ watching: number; live: boolean }, string>({
      queryFn: (token) =>
        toQueryResult(
          async () =>
            (
              await apiClient.post<{ watching: number; live: boolean }>(
                `/invitation/shared/${encodeURIComponent(token)}/live/ping`,
              )
            ).data,
        ),
    }),
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

export const {
  useGetSharedInvitationQuery,
  useDismissGuestNotificationMutation,
  usePingGuestLiveMutation,
} = guestInvitationApi;
