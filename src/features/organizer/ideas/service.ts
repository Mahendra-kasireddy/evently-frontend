import { apiClient } from '@lib/api';
import { baseApi, toQueryResult } from '@lib/rtk';
import type { Idea, IdeaBoard, IdeaImage, IdeaPlanStatus, IdeaType } from '@features/board';

export type { Idea, IdeaBoard, IdeaPlanStatus };

export interface ReplyBody {
  status: IdeaPlanStatus;
  text: string;
  approvalLabel?: string | undefined;
}

export interface OrganizerPostBody {
  text: string;
  type?: IdeaType | undefined;
  images?: IdeaImage[] | undefined;
}

export interface VisionBody {
  theme?: string;
  vibe?: string;
  surprise?: string;
  food?: string;
  surpriseConfidential?: boolean;
}

/**
 * The organizer's half of a booking's ideas board.
 *
 * The same documents the customer reads: replying here is what puts a status
 * and an approval request on their copy, and the vision written here is what
 * they see on their own board. Both sides share the `Ideas` cache tag, so
 * neither can be looking at a stale version of the other's work.
 */
export const organizerIdeaApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getOrganizerIdeas: build.query<IdeaBoard, string>({
      queryFn: (bookingId) =>
        toQueryResult(
          async () => (await apiClient.get<IdeaBoard>(`/idea/organizer/${bookingId}`)).data,
        ),
      providesTags: ['Ideas'],
    }),

    /** An update or a question from the organizer, onto the same feed. */
    postOrganizerIdea: build.mutation<Idea, { bookingId: string; body: OrganizerPostBody }>({
      queryFn: ({ bookingId, body }) =>
        toQueryResult(
          async () => (await apiClient.post<Idea>(`/idea/organizer/${bookingId}`, body)).data,
        ),
      invalidatesTags: ['Ideas', 'Notifications'],
    }),

    replyToIdea: build.mutation<Idea, { ideaId: string; body: ReplyBody }>({
      queryFn: ({ ideaId, body }) =>
        toQueryResult(
          async () => (await apiClient.post<Idea>(`/idea/organizer/${ideaId}/reply`, body)).data,
        ),
      invalidatesTags: ['Ideas', 'Notifications'],
    }),

    /** The organizer's summary of the event, which the customer reads back. */
    updateVision: build.mutation<IdeaBoard, { bookingId: string; body: VisionBody }>({
      queryFn: ({ bookingId, body }) =>
        toQueryResult(
          async () =>
            (await apiClient.patch<IdeaBoard>(`/idea/organizer/${bookingId}/vision`, body)).data,
        ),
      invalidatesTags: ['Ideas', 'Notifications'],
    }),
  }),
});

export const {
  useGetOrganizerIdeasQuery,
  usePostOrganizerIdeaMutation,
  useReplyToIdeaMutation,
  useUpdateVisionMutation,
} = organizerIdeaApi;
