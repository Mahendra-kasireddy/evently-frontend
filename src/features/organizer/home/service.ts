import { baseApi, toQueryResult } from '@lib/rtk';
import type { HomeSummary } from './types';

/** Mock summary. Swap for apiClient.get('/organizer/home') later. */
export async function fetchHomeSummary(): Promise<HomeSummary> {
  await new Promise((r) => setTimeout(r, 200));
  return { title: 'Organizer dashboard' };
}

export const organizerHomeApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getOrganizerHome: build.query<HomeSummary, void>({
      queryFn: () => toQueryResult(() => fetchHomeSummary()),
    }),
  }),
});

export const { useGetOrganizerHomeQuery } = organizerHomeApi;
