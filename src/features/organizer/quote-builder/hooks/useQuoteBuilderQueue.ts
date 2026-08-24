import { useState } from 'react';
import { useGetIncomingQuotesQuery } from '@features/organizer/quotes/service';
import { STAGE_FOR_FILTER, stageOf } from '../constants';
import type { ApiIncomingRequest, QuoteFilter, QuoteStage } from '../types';

export interface StagedRequest {
  request: ApiIncomingRequest;
  stage: QuoteStage;
}

/**
 * The quoting queue. Reads the same cached `GET /quote/incoming` the Enquiries
 * inbox uses — no second network trip — and groups it by quoting stage, which
 * is the one thing the enquiry list doesn't surface.
 */
export function useQuoteBuilderQueue() {
  const { data: requests = [], isLoading, isError, refetch, isFetching } = useGetIncomingQuotesQuery();
  const [filter, setFilter] = useState<QuoteFilter>('All');

  const staged: StagedRequest[] = requests
    .map((request) => ({ request, stage: stageOf(request) }))
    .filter((entry): entry is StagedRequest => entry.stage !== null);

  const byStage = (stage: QuoteStage) => staged.filter((s) => s.stage === stage);
  const awaiting = byStage('awaiting');
  const drafts = byStage('draft');
  const sent = byStage('sent');

  const counts: Record<QuoteFilter, number> = {
    All: staged.length,
    Awaiting: awaiting.length,
    Drafts: drafts.length,
    Sent: sent.length,
  };

  const visible = filter === 'All' ? staged : byStage(STAGE_FOR_FILTER[filter]);

  // Value already quoted out and still live — the sum of what's on the table.
  const sentValue = sent.reduce((sum, s) => sum + (s.request.myQuotation?.grandTotal ?? 0), 0);

  return {
    isLoading,
    isError,
    isFetching,
    refetch,
    filter,
    setFilter,
    counts,
    visible,
    awaiting,
    drafts,
    sent,
    sentValue,
    hasAny: staged.length > 0,
  };
}
