import { apiClient } from '@lib/api';
import { baseApi, toQueryResult } from '@lib/rtk';
import type { Invitation } from '@features/invitation';

/**
 * The customer's guest invitation, for one booking.
 *
 * One endpoint serves both the summary card on the booked-event workspace and
 * the review screen itself, so they share a single RTK cache entry: personalize
 * a section here and the card's state updates without a second request, and
 * neither surface can be showing a different status from the other.
 *
 * The query 404s while the invitation is still the organizer's draft — that is
 * the normal early state, not a failure, and the screens render it as such.
 */
export type CustomerInvitation = Invitation;

export interface PersonalizeArgs {
  bookingId: string;
  blockKey: string;
  heading?: string;
  body?: string;
  hidden?: boolean;
}

export interface RequestChangeArgs {
  bookingId: string;
  /** Omitted when the ask is about the invitation as a whole. */
  blockKey?: string;
  note: string;
}

/** One row per invitation the customer can see — enough to badge a card. */
export interface InvitationSummary {
  bookingId: string;
  status: 'sent' | 'approved';
}

export const customerInvitationApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /*
     * Every invitation shared with the customer, in one request. My Events
     * needs this before it can sort events into tabs — an invitation waiting
     * on the customer's approval is the customer's move, and one query for the
     * list beats one per card.
     */
    getMyInvitations: build.query<InvitationSummary[], void>({
      queryFn: () =>
        toQueryResult(
          async () => (await apiClient.get<InvitationSummary[]>('/invitation/mine')).data,
        ),
      providesTags: ['Invitation'],
    }),

    getMyInvitation: build.query<CustomerInvitation, string>({
      queryFn: (bookingId) =>
        toQueryResult(
          async () =>
            (await apiClient.get<CustomerInvitation>(`/invitation/mine/${bookingId}`)).data,
        ),
      providesTags: ['Invitation'],
    }),

    approveMyInvitation: build.mutation<CustomerInvitation, string>({
      queryFn: (bookingId) =>
        toQueryResult(
          async () =>
            (await apiClient.post<CustomerInvitation>(`/invitation/mine/${bookingId}/approve`))
              .data,
        ),
      invalidatesTags: ['Invitation', 'Bookings', 'CustomerHome', 'Notifications'],
    }),

    /** Edit a section the customer owns; the API rejects anyone else's. */
    personalizeInvitationBlock: build.mutation<CustomerInvitation, PersonalizeArgs>({
      queryFn: ({ bookingId, blockKey, ...patch }) =>
        toQueryResult(
          async () =>
            (
              await apiClient.patch<CustomerInvitation>(
                `/invitation/mine/${bookingId}/blocks/${encodeURIComponent(blockKey)}`,
                patch,
              )
            ).data,
        ),
      invalidatesTags: ['Invitation'],
    }),

    /** Ask the organizer for a change to a section they own. */
    requestInvitationChange: build.mutation<CustomerInvitation, RequestChangeArgs>({
      queryFn: ({ bookingId, ...body }) =>
        toQueryResult(
          async () =>
            (
              await apiClient.post<CustomerInvitation>(
                `/invitation/mine/${bookingId}/request-change`,
                body,
              )
            ).data,
        ),
      invalidatesTags: ['Invitation', 'Notifications'],
    }),
  }),
});

export const {
  useGetMyInvitationsQuery,
  useGetMyInvitationQuery,
  useApproveMyInvitationMutation,
  usePersonalizeInvitationBlockMutation,
  useRequestInvitationChangeMutation,
} = customerInvitationApi;
