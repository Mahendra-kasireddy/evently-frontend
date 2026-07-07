import { apiClient } from '@lib/api';
import { baseApi, toQueryResult } from '@lib/rtk';
import type {
  HomeContent,
  ProfileSummary,
  BookedEventData,
  PackageItem,
  Organizer,
} from './types';

/** Aggregated home payload from the backend `home` screen-module. */
export interface HomeFeed {
  user: ProfileSummary;
  content: HomeContent;
  packages: PackageItem[];
  topOrganizers: Organizer[];
  booking: BookedEventData | null;
  unreadCount: number;
}

async function fetchHomeFeed(): Promise<HomeFeed> {
  const { data } = await apiClient.get<HomeFeed>('/home/getHomeFeed');
  return data;
}

export const homeApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getHomeFeed: build.query<HomeFeed, void>({
      queryFn: () => toQueryResult(() => fetchHomeFeed()),
      providesTags: ['CustomerHome'],
    }),
  }),
});

export const { useGetHomeFeedQuery } = homeApi;
