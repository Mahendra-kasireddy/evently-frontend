import { apiClient } from '@lib/api';
import { baseApi, toQueryResult } from '@lib/rtk';
import type { ApiQuotation, RespondQuotationBody } from './types';

/**
 * Compose/edit/withdraw one quotation. There's no single "get one request by
 * id" endpoint for organizers — the target request is resolved from the
 * already-cached GET /quote/incoming list (see hooks/useQuoteRespond.ts),
 * not fetched again here.
 */
export const quoteRespondApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    respondToQuote: build.mutation<ApiQuotation, { requestId: string; body: RespondQuotationBody }>({
      queryFn: ({ requestId, body }) =>
        toQueryResult(
          async () => (await apiClient.post<ApiQuotation>(`/quote/respond/${requestId}`, body)).data,
        ),
      invalidatesTags: ['OrganizerQuotes'],
    }),
    updateQuotation: build.mutation<ApiQuotation, { id: string; body: Partial<RespondQuotationBody> }>({
      queryFn: ({ id, body }) =>
        toQueryResult(
          async () => (await apiClient.patch<ApiQuotation>(`/quote/updateQuotation/${id}`, body)).data,
        ),
      invalidatesTags: ['OrganizerQuotes'],
    }),
    withdrawQuotation: build.mutation<ApiQuotation, string>({
      queryFn: (id) =>
        toQueryResult(
          async () => (await apiClient.patch<ApiQuotation>(`/quote/withdrawQuotation/${id}`)).data,
        ),
      invalidatesTags: ['OrganizerQuotes'],
    }),
  }),
});

export const { useRespondToQuoteMutation, useUpdateQuotationMutation, useWithdrawQuotationMutation } =
  quoteRespondApi;
