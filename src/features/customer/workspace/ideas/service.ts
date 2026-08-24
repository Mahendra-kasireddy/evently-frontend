import { apiClient } from '@lib/api';
import { baseApi, toQueryResult } from '@lib/rtk';
import type { Idea, IdeaBoard, IdeaImage, IdeaType } from '@features/board';

/*
 * The board's shape is shared with the organizer's side — see `@features/board`.
 * Re-exported here so the customer's screens keep importing these types from
 * the one place they already reference.
 */
export type {
  Idea,
  IdeaBoard,
  IdeaCounts,
  IdeaImage,
  IdeaReply,
  IdeaType,
  BoardVision,
} from '@features/board';

export interface CreateIdeaBody {
  text: string;
  type?: IdeaType | undefined;
  confidential?: boolean | undefined;
  images?: IdeaImage[] | undefined;
}

/**
 * The board, its counts and the organizer's vision come from one endpoint, so
 * the workspace summary and the board screen share a single cache entry —
 * posting from the board updates the workspace's counts without a second
 * request.
 */
export const ideaApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getIdeaBoard: build.query<IdeaBoard, string>({
      queryFn: (bookingId) =>
        toQueryResult(async () => (await apiClient.get<IdeaBoard>(`/idea/mine/${bookingId}`)).data),
      providesTags: ['Ideas'],
    }),
    createIdea: build.mutation<Idea, { bookingId: string; body: CreateIdeaBody }>({
      queryFn: ({ bookingId, body }) =>
        toQueryResult(
          async () => (await apiClient.post<Idea>(`/idea/mine/${bookingId}`, body)).data,
        ),
      invalidatesTags: ['Ideas'],
    }),
    approveIdea: build.mutation<Idea, string>({
      queryFn: (ideaId) =>
        toQueryResult(async () => (await apiClient.post<Idea>(`/idea/mine/${ideaId}/approve`)).data),
      invalidatesTags: ['Ideas', 'Notifications'],
    }),
  }),
});

export const { useGetIdeaBoardQuery, useCreateIdeaMutation, useApproveIdeaMutation } = ideaApi;
