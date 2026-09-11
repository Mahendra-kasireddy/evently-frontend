import { apiClient } from '@lib/api';
import { baseApi, toQueryResult } from '@lib/rtk';
import type { ApiCouponQuote, ApiEligibleCoupon } from './types';

/**
 * Coupons, from the customer's side.
 *
 * Both endpoints take a quotation id and nothing else. The amount and the
 * organizer are read from that quotation on the server, so there is no request
 * this client could make that prices a coupon against a total it chose.
 *
 * `previewCoupon` is a mutation only because it is a POST — it changes nothing.
 * The coupon is spent when the booking is created, not here.
 */
export const customerCouponsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAvailableCoupons: build.query<ApiEligibleCoupon[], string>({
      queryFn: (quotationId) =>
        toQueryResult(
          async () =>
            (
              await apiClient.get<ApiEligibleCoupon[]>('/coupon/available', {
                params: { quotationId },
              })
            ).data,
        ),
      providesTags: ['Coupons'],
    }),

    previewCoupon: build.mutation<ApiCouponQuote, { quotationId: string; code: string }>({
      queryFn: (body) =>
        toQueryResult(
          async () => (await apiClient.post<ApiCouponQuote>('/coupon/preview', body)).data,
        ),
    }),
  }),
});

export const { useGetAvailableCouponsQuery, usePreviewCouponMutation } = customerCouponsApi;
