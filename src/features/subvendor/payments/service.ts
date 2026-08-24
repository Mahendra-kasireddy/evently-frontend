import { apiClient } from '@lib/api';
import { baseApi, toQueryResult } from '@lib/rtk';
import type { OrganizerRef, SubVendorPerformance } from './types';

/** Sub-vendor's own performance & payments — 100% derived from real task/payment data. */
export const subVendorPaymentsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMyPerformance: build.query<SubVendorPerformance, void>({
      queryFn: () =>
        toQueryResult(
          async () =>
            (await apiClient.get<SubVendorPerformance>('/booking/subvendor/performance')).data,
        ),
      providesTags: ['SubVendorTasks'],
    }),
    getMyOrganizers: build.query<OrganizerRef[], void>({
      queryFn: () =>
        toQueryResult(async () => (await apiClient.get<OrganizerRef[]>('/subvendor/my-organizers')).data),
      providesTags: ['SubVendorLinks'],
    }),
  }),
});

export const { useGetMyPerformanceQuery, useGetMyOrganizersQuery } = subVendorPaymentsApi;
