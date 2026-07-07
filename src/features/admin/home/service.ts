import { baseApi, toQueryResult } from '@lib/rtk';
import type { HomeSummary } from './types';

/** Mock summary. Swap for apiClient.get('/admin/home') later. */
export async function fetchHomeSummary(): Promise<HomeSummary> {
  await new Promise((r) => setTimeout(r, 200));
  return { title: 'Platform overview' };
}

export const adminHomeApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAdminHome: build.query<HomeSummary, void>({
      queryFn: () => toQueryResult(() => fetchHomeSummary()),
    }),
  }),
});

export const { useGetAdminHomeQuery } = adminHomeApi;
