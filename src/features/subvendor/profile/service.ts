import { apiClient } from '@lib/api';
import { baseApi, toQueryResult } from '@lib/rtk';
import type { SubVendorProfile } from './types';

/** What a vendor may change about themselves — the server enforces the rest. */
export interface UpdateProfileArgs {
  serviceArea?: string;
  baseRate?: number;
  minOrder?: number;
  active?: boolean;
}

export const subVendorProfileApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMySubVendorProfile: build.query<SubVendorProfile, void>({
      queryFn: () =>
        toQueryResult(async () => (await apiClient.get<SubVendorProfile>('/subvendor/profile')).data),
      providesTags: ['SubVendorLinks'],
    }),

    updateMySubVendorProfile: build.mutation<SubVendorProfile, UpdateProfileArgs>({
      queryFn: (body) =>
        toQueryResult(
          async () => (await apiClient.patch<SubVendorProfile>('/subvendor/profile', body)).data,
        ),
      /*
       * The rate card is what an organizer sees when assigning work, and
       * availability decides whether they see this vendor at all — so both
       * task lists are invalidated rather than only the profile.
       */
      invalidatesTags: ['SubVendorLinks', 'SubVendorTasks'],
    }),
  }),
});

export const { useGetMySubVendorProfileQuery, useUpdateMySubVendorProfileMutation } =
  subVendorProfileApi;
