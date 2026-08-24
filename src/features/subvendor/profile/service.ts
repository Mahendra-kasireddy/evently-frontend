import { apiClient } from '@lib/api';
import { baseApi, toQueryResult } from '@lib/rtk';
import type { SubVendorProfile } from './types';

export const subVendorProfileApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMySubVendorProfile: build.query<SubVendorProfile, void>({
      queryFn: () =>
        toQueryResult(async () => (await apiClient.get<SubVendorProfile>('/subvendor/profile')).data),
    }),
  }),
});

export const { useGetMySubVendorProfileQuery } = subVendorProfileApi;
