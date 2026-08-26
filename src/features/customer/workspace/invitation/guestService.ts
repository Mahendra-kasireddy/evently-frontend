import { apiClient } from '@lib/api';
import { baseApi, toQueryResult } from '@lib/rtk';

/**
 * Guests of one published invitation, and sharing it with them.
 *
 * Separate from `service.ts` because these endpoints have a different lifetime:
 * the invitation exists from the moment the organizer starts building it, while
 * guests only exist once the customer has approved and is sending it out.
 */

/** How the API is configured to reach WhatsApp. */
export type ShareMode = 'handoff' | 'cloud';

export type ShareStatus = 'handed_off' | 'sent' | 'failed';

export interface Guest {
  id: string;
  name: string;
  /** E.164 — the key the API de-duplicates on. */
  phone: string;
  /** Grouped for reading, e.g. `+91 95050 43404`. */
  phoneDisplay: string;
  /** Block keys already shared; '' means the complete invitation went. */
  sharedSections: string[];
  lastSharedAt: string | null;
  viewed: boolean;
}

export interface ShareOutcome {
  guest: Guest;
  status: ShareStatus;
  /**
   * Handoff mode only: the wa.me link the browser must open for the customer
   * to actually press send. Absent in cloud mode, where the server sent it.
   */
  handoffUrl?: string;
  url: string;
  error?: string;
}

export interface ShareResult {
  mode: ShareMode;
  results: ShareOutcome[];
}

export interface NewGuest {
  name: string;
  phone: string;
}

export interface ShareArgs {
  bookingId: string;
  /** A block key, or omitted for the complete invitation. */
  section?: string;
  guestIds?: string[];
  newGuests?: NewGuest[];
}

export const invitationGuestApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getInvitationGuests: build.query<Guest[], string>({
      queryFn: (bookingId) =>
        toQueryResult(
          async () => (await apiClient.get<Guest[]>(`/invitation/mine/${bookingId}/guests`)).data,
        ),
      providesTags: ['InvitationGuests'],
    }),

    /**
     * Adds a guest. A number already on the list comes back as a 409 carrying
     * the guest who holds it, which the dialog turns into "use Rahul" rather
     * than a dead end.
     */
    addInvitationGuest: build.mutation<Guest, { bookingId: string } & NewGuest>({
      queryFn: ({ bookingId, ...body }) =>
        toQueryResult(
          async () =>
            (await apiClient.post<Guest>(`/invitation/mine/${bookingId}/guests`, body)).data,
        ),
      invalidatesTags: ['InvitationGuests'],
    }),

    /** One endpoint for both a single section and the complete invitation. */
    shareInvitation: build.mutation<ShareResult, ShareArgs>({
      queryFn: ({ bookingId, ...body }) =>
        toQueryResult(
          async () =>
            (await apiClient.post<ShareResult>(`/invitation/mine/${bookingId}/share`, body)).data,
        ),
      invalidatesTags: ['InvitationGuests'],
    }),
  }),
});

export const {
  useGetInvitationGuestsQuery,
  useAddInvitationGuestMutation,
  useShareInvitationMutation,
} = invitationGuestApi;
