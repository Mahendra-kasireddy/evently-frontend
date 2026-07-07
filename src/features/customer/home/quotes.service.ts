import { apiClient } from '@lib/api';
import { baseApi, toQueryResult } from '@lib/rtk';
import type { HeroDraft } from './types';

export interface QuoteRequest {
  id: string;
  occasion: string;
  status: string;
}

/** Hero "Get quotes" — open request from the current draft. */
async function postRequestQuotes(draft: HeroDraft): Promise<QuoteRequest> {
  const { data } = await apiClient.post<QuoteRequest>('/quote/requestQuotes', draft);
  return data;
}

/** Organizer card "Get quote" — targeted request. */
async function postRequestQuoteFromOrganizer(args: {
  organizerId: string;
  draft: HeroDraft;
}): Promise<QuoteRequest> {
  const { data } = await apiClient.post<QuoteRequest>('/quote/requestQuoteFromOrganizer', {
    organizerId: args.organizerId,
    ...args.draft,
  });
  return data;
}

export const quotesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    requestQuotes: build.mutation<QuoteRequest, HeroDraft>({
      queryFn: (draft) => toQueryResult(() => postRequestQuotes(draft)),
      invalidatesTags: ['Quotes'],
    }),
    requestQuoteFromOrganizer: build.mutation<
      QuoteRequest,
      { organizerId: string; draft: HeroDraft }
    >({
      queryFn: (args) => toQueryResult(() => postRequestQuoteFromOrganizer(args)),
      invalidatesTags: ['Quotes'],
    }),
  }),
});

export const { useRequestQuotesMutation, useRequestQuoteFromOrganizerMutation } = quotesApi;
