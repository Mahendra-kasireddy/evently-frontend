import { apiClient } from '@lib/api';
import { baseApi, toQueryResult } from '@lib/rtk';
import type { ApiCoupon, ApiCouponRedemption, CouponStatus, CouponTermsInput } from './types';

/**
 * The organizer's own coupons.
 *
 * Every route is `/coupon/organizer/*`, which is scoped to the signed-in
 * organizer on the server. No request here carries an organizer id, because
 * none of these endpoints accept one.
 */
export const organizerCouponsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMyCoupons: build.query<ApiCoupon[], void>({
      queryFn: () =>
        toQueryResult(async () => (await apiClient.get<ApiCoupon[]>('/coupon/organizer/mine')).data),
      providesTags: ['Coupons'],
    }),

    getMyCouponUsage: build.query<ApiCouponRedemption[], void>({
      queryFn: () =>
        toQueryResult(
          async () =>
            (await apiClient.get<ApiCouponRedemption[]>('/coupon/organizer/usage')).data,
        ),
      providesTags: ['CouponUsage'],
    }),

    createMyCoupon: build.mutation<ApiCoupon, CouponTermsInput>({
      queryFn: (body) =>
        toQueryResult(
          async () => (await apiClient.post<ApiCoupon>('/coupon/organizer', body)).data,
        ),
      invalidatesTags: ['Coupons'],
    }),

    setMyCouponStatus: build.mutation<ApiCoupon, { id: string; status: CouponStatus }>({
      queryFn: ({ id, status }) =>
        toQueryResult(
          async () =>
            (await apiClient.patch<ApiCoupon>(`/coupon/organizer/${id}/status`, { status })).data,
        ),
      invalidatesTags: ['Coupons'],
    }),
  }),
});

export const {
  useGetMyCouponsQuery,
  useGetMyCouponUsageQuery,
  useCreateMyCouponMutation,
  useSetMyCouponStatusMutation,
} = organizerCouponsApi;
