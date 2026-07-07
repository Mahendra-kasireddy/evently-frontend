import { apiClient } from '@lib/api';
import { baseApi, toQueryResult } from '@lib/rtk';
import type { ProfileSummary } from './types';

/** Signed-in user's header/greeting summary. Authenticated (bearer token). */
async function fetchProfileSummary(): Promise<ProfileSummary> {
  const { data } = await apiClient.get<ProfileSummary>('/user/getProfileSummary');
  return data;
}

export const profileApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getProfileSummary: build.query<ProfileSummary, void>({
      queryFn: () => toQueryResult(() => fetchProfileSummary()),
      providesTags: ['Profile'],
    }),
  }),
});

export const { useGetProfileSummaryQuery } = profileApi;
