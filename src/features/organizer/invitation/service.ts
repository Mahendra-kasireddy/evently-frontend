import type { AxiosRequestConfig } from 'axios';
import { apiClient } from '@lib/api';
import { baseApi, toQueryResult } from '@lib/rtk';
import type { OrganizerInvitation, UpdateInvitationBody } from './types';

/**
 * Guest invitation builder (P-15). Every field on the screen — sections,
 * ownership, template list and approval state — comes from these endpoints;
 * nothing about the invitation is held only in the browser.
 */
/** One shared memory, as the organizer running the celebration reads it. */
export interface OrganizerMemory {
  id: string;
  kind: 'photo' | 'video' | 'reel';
  subEvent: string;
  /** The original; the grid and the viewer both read a smaller rendition. */
  url: string;
  thumbnailUrl: string;
  displayUrl: string;
  caption: string;
  durationSec: number;
  likes: number;
  uploader: string;
  status: string;
  moderationStatus: string;
  createdAt: string;
}

export interface OrganizerGallery {
  items: OrganizerMemory[];
  nextCursor: string;
  counts: { all: number; photo: number; video: number; reel: number };
  awaiting: number;
  subEvents: Array<{ id: string; name: string }>;
}

export const invitationApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /**
     * The gallery, for the organizer running this celebration.
     *
     * Read and add, and that is the whole of it: there is no organizer route
     * to the settings, the moderation queue or deletion, because those are
     * decisions about the customer's own photographs.
     */
    getOrganizerMemories: build.query<
      OrganizerGallery,
      { bookingId: string; kind?: string; subEvent?: string }
    >({
      queryFn: ({ bookingId, kind, subEvent }) =>
        toQueryResult(async () => {
          const params = new URLSearchParams();
          if (kind && kind !== 'all') params.set('kind', kind);
          if (subEvent && subEvent !== 'all') params.set('subEvent', subEvent);
          const query = params.toString();
          return (
            await apiClient.get<OrganizerGallery>(
              `/invitation/organizer/${encodeURIComponent(bookingId)}/memories${
                query ? `?${query}` : ''
              }`,
            )
          ).data;
        }),
      providesTags: ['OrganizerMemories'],
    }),

    /** The organizer adding one of their own photographs. */
    addOrganizerMemory: build.mutation<
      { status: string; message: string },
      { bookingId: string; file: File; subEventId?: string; caption?: string }
    >({
      queryFn: ({ bookingId, file, subEventId, caption }) =>
        toQueryResult(async () => {
          const body = new FormData();
          body.append('file', file);
          if (subEventId) body.append('subEventId', subEventId);
          if (caption) body.append('caption', caption);
          /* Letting the browser set the multipart boundary. The shared
             client is configured with a JSON content type, which axios would
             otherwise keep — and a multipart body with no boundary reaches the
             server as no file at all. Same override as the artwork upload. */
          const config = { headers: { 'Content-Type': undefined } } as unknown as AxiosRequestConfig;
          return (
            await apiClient.post<{ status: string; message: string }>(
              `/invitation/organizer/${encodeURIComponent(bookingId)}/memories`,
              body,
              config,
            )
          ).data;
        }),
      /* The customer's and the guests' views of the same gallery. */
      invalidatesTags: ['OrganizerMemories', 'ManagedMemories', 'GuestMemories'],
    }),
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
  useGetOrganizerMemoriesQuery,
  useAddOrganizerMemoryMutation,
  useGetInvitationQuery,
  useUpdateInvitationMutation,
  useSendInvitationMutation,
  useResolveChangeRequestMutation,
} = invitationApi;
