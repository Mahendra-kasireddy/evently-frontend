import { apiClient } from '@lib/api';
import { baseApi, toQueryResult } from '@lib/rtk';
import type {
  ApiQuotation,
  ApiQuoteRequestDetail,
  ApiQuoteRequestSummary,
} from './types';

/**
 * Quotes data layer — 100% MongoDB-backed via the backend quote module.
 * No mock JSON: every hook here hits a real REST endpoint.
 */
export const quotesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // ----- Customer: read -----
    getQuoteRequests: build.query<ApiQuoteRequestSummary[], void>({
      queryFn: () =>
        toQueryResult(
          async () => (await apiClient.get<ApiQuoteRequestSummary[]>('/quote/getMyQuotes')).data,
        ),
      providesTags: ['Quotes'],
    }),
    getQuoteRequest: build.query<ApiQuoteRequestDetail, string>({
      queryFn: (id) =>
        toQueryResult(
          async () =>
            (await apiClient.get<ApiQuoteRequestDetail>(`/quote/getQuoteRequest/${id}`)).data,
        ),
      providesTags: ['Quotes'],
    }),
    getQuotation: build.query<ApiQuotation, string>({
      queryFn: (id) =>
        toQueryResult(
          async () => (await apiClient.get<ApiQuotation>(`/quote/getQuotation/${id}`)).data,
        ),
      providesTags: ['Quotes'],
    }),

    // ----- Customer: actions -----
    acceptQuotation: build.mutation<ApiQuotation, string>({
      queryFn: (id) =>
        toQueryResult(
          async () => (await apiClient.post<ApiQuotation>(`/quote/acceptQuotation/${id}`)).data,
        ),
      invalidatesTags: ['Quotes', 'Notifications'],
    }),
    rejectQuotation: build.mutation<ApiQuotation, string>({
      queryFn: (id) =>
        toQueryResult(
          async () => (await apiClient.post<ApiQuotation>(`/quote/rejectQuotation/${id}`)).data,
        ),
      invalidatesTags: ['Quotes', 'Notifications'],
    }),
    cancelQuoteRequest: build.mutation<{ id: string; status: string }, string>({
      queryFn: (id) =>
        toQueryResult(
          async () =>
            (await apiClient.patch<{ id: string; status: string }>(`/quote/cancelRequest/${id}`))
              .data,
        ),
      invalidatesTags: ['Quotes', 'Notifications'],
    }),
  }),
});

export const {
  useGetQuoteRequestsQuery,
  useGetQuoteRequestQuery,
  useGetQuotationQuery,
  useAcceptQuotationMutation,
  useRejectQuotationMutation,
  useCancelQuoteRequestMutation,
} = quotesApi;
