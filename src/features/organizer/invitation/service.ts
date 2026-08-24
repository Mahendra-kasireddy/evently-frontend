import { apiClient } from '@lib/api';
import { baseApi, toQueryResult } from '@lib/rtk';
import type { OrganizerInvitation, UpdateInvitationBody } from './types';

/**
 * Guest invitation builder (P-15). Every field on the screen — sections,
 * ownership, template list and approval state — comes from these endpoints;
 * nothing about the invitation is held only in the browser.
 */
export const invitationApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getInvitation: build.query<OrganizerInvitation, string>({
      queryFn: (bookingId) =>
        toQueryResult(
          async () =>
            (await apiClient.get<OrganizerInvitation>(`/invitation/organizer/${bookingId}`)).data,
        ),
      providesTags: ['Invitation'],
    }),
    updateInvitation: build.mutation<
      OrganizerInvitation,
      { bookingId: string; body: UpdateInvitationBody }
    >({
      queryFn: ({ bookingId, body }) =>
        toQueryResult(
          async () =>
            (await apiClient.patch<OrganizerInvitation>(`/invitation/organizer/${bookingId}`, body))
              .data,
        ),
      invalidatesTags: ['Invitation'],
    }),
    sendInvitation: build.mutation<OrganizerInvitation, string>({
      queryFn: (bookingId) =>
        toQueryResult(
          async () =>
            (await apiClient.post<OrganizerInvitation>(`/invitation/organizer/${bookingId}/send`))
              .data,
        ),
      invalidatesTags: ['Invitation', 'Notifications'],
    }),
    /** Clear one of the customer's change requests once it has been dealt with. */
    resolveChangeRequest: build.mutation<
      OrganizerInvitation,
      { bookingId: string; requestId: string }
    >({
      queryFn: ({ bookingId, requestId }) =>
        toQueryResult(
          async () =>
            (
              await apiClient.post<OrganizerInvitation>(
                `/invitation/organizer/${bookingId}/change-requests/${requestId}/resolve`,
              )
            ).data,
        ),
      invalidatesTags: ['Invitation'],
    }),
  }),
});

export const {
  useGetInvitationQuery,
  useUpdateInvitationMutation,
  useSendInvitationMutation,
  useResolveChangeRequestMutation,
} = invitationApi;
