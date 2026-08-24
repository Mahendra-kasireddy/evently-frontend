import type { ApiIncomingRequest, QuoteFilter, QuoteStage } from './types';

export const QUOTE_BUILDER_COPY = {
  subtitle: 'Everything waiting on a price, and every quote you have already built.',
  notice: 'Drafts are private — the customer sees nothing until you send.',
  awaitingTitle: 'Awaiting your quote',
  draftTitle: 'Drafts',
  sentTitle: 'Sent',
  build: 'Build quote',
  continueDraft: 'Continue draft',
  revise: 'Revise quote',
  emptyAllTitle: 'Nothing to quote yet',
  emptyAllBody: 'New enquiries land here the moment a customer asks you for a price.',
  emptyAwaitingTitle: 'No enquiries waiting',
  emptyAwaitingBody: 'Every open enquiry already has a quote against it.',
  emptyDraftsTitle: 'No drafts',
  emptyDraftsBody: 'Save a quote as a draft and it will sit here until you send it.',
  emptySentTitle: 'Nothing sent yet',
  emptySentBody: 'Quotes you send appear here so you can revise them.',
} as const;

export const QUOTE_FILTERS: readonly QuoteFilter[] = ['All', 'Awaiting', 'Drafts', 'Sent'];

/** Requests the organizer can no longer act on are kept out of the builder. */
const DEAD_REQUEST_STATUSES = new Set(['cancelled', 'closed']);

/**
 * A request's quoting stage. `null` quotation means it still needs one;
 * otherwise the quotation's own status decides. Withdrawn/rejected quotes drop
 * back to "awaiting" because the organizer can quote again.
 */
export function stageOf(request: ApiIncomingRequest): QuoteStage | null {
  if (DEAD_REQUEST_STATUSES.has(request.status)) return null;
  const q = request.myQuotation;
  if (!q) return 'awaiting';
  if (q.status === 'draft') return 'draft';
  if (q.status === 'sent' || q.status === 'updated') return 'sent';
  // accepted / rejected / withdrawn are settled — they belong to Enquiries.
  return null;
}

export const STAGE_FOR_FILTER: Record<Exclude<QuoteFilter, 'All'>, QuoteStage> = {
  Awaiting: 'awaiting',
  Drafts: 'draft',
  Sent: 'sent',
};

export const CTA_FOR_STAGE: Record<QuoteStage, string> = {
  awaiting: QUOTE_BUILDER_COPY.build,
  draft: QUOTE_BUILDER_COPY.continueDraft,
  sent: QUOTE_BUILDER_COPY.revise,
};
