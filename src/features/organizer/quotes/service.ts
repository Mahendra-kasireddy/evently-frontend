import { apiClient } from '@lib/api';
import { baseApi, toQueryResult } from '@lib/rtk';
import type { ApiIncomingRequest } from './types';

/**
 * Organizer's incoming-request data layer — 100% MongoDB-backed via the
 * backend quote module's organizer-facing routes. No mock data.
 */
export const organizerQuotesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getIncomingQuotes: build.query<ApiIncomingRequest[], void>({
      queryFn: () =>
        toQueryResult(async () => (await apiClient.get<ApiIncomingRequest[]>('/quote/incoming')).data),
      providesTags: ['OrganizerQuotes'],
    }),
  }),
});

export const { useGetIncomingQuotesQuery } = organizerQuotesApi;
