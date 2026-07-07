import { baseApi, toQueryResult } from '@lib/rtk';
import type { HomeSummary } from './types';

/** Mock summary. Swap for apiClient.get('/subvendor/home') later. */
export async function fetchHomeSummary(): Promise<HomeSummary> {
  await new Promise((r) => setTimeout(r, 200));
  return { title: 'Sub-vendor home' };
}

export const subvendorHomeApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getSubvendorHome: build.query<HomeSummary, void>({
      queryFn: () => toQueryResult(() => fetchHomeSummary()),
    }),
  }),
});

export const { useGetSubvendorHomeQuery } = subvendorHomeApi;
