import { apiClient } from '@lib/api';
import { baseApi, toQueryResult } from '@lib/rtk';
import type { ApiSubVendorLink } from './types';

/** Organizer's sub-vendor roster — 100% MongoDB-backed. No mock data. */
export const organizerSubvendorsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMySubvendors: build.query<ApiSubVendorLink[], void>({
      queryFn: () =>
        toQueryResult(
          async () => (await apiClient.get<ApiSubVendorLink[]>('/booking/organizer/subvendors')).data,
        ),
      providesTags: ['SubVendorLinks'],
    }),
    inviteSubvendor: build.mutation<{ linkId: string; status: string }, { phone: string }>({
      queryFn: (body) =>
        toQueryResult(
          async () =>
            (await apiClient.post<{ linkId: string; status: string }>('/organizer/subvendors/invite', body))
              .data,
        ),
      invalidatesTags: ['SubVendorLinks'],
    }),
    removeSubvendor: build.mutation<void, string>({
      queryFn: (linkId) =>
        toQueryResult(async () => {
          await apiClient.delete(`/organizer/subvendors/${linkId}`);
        }),
      invalidatesTags: ['SubVendorLinks'],
    }),
  }),
});

export const { useGetMySubvendorsQuery, useInviteSubvendorMutation, useRemoveSubvendorMutation } =
  organizerSubvendorsApi;
