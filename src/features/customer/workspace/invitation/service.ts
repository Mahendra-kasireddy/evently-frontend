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

export const customerInvitationApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
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
  useGetMyInvitationQuery,
  useApproveMyInvitationMutation,
  usePersonalizeInvitationBlockMutation,
  useRequestInvitationChangeMutation,
} = customerInvitationApi;
