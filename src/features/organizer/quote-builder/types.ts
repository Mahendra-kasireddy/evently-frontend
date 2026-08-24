export type { ApiIncomingRequest, ApiQuotation } from '@features/organizer/quotes/types';

/**
 * Which stage of quoting a request is at, from the organizer's point of view.
 * Derived from `myQuotation` — the API has no such field, and doesn't need
 * one, because the quotation's own status already carries it.
 */
export type QuoteStage = 'awaiting' | 'draft' | 'sent';

export type QuoteFilter = 'All' | 'Awaiting' | 'Drafts' | 'Sent';
