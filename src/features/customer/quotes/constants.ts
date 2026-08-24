import type { QuoteRequestStatus } from './types';

/**
 * Legacy query param that pinned the request on the old flat /quotes screen. The
 * comparison now lives at /workspace/:requestId (see workspace/routes.ts), so
 * this is read only by the redirect that forwards old links there.
 */
export const REQUEST_PARAM = 'request';

export const REQUEST_STATUS_LABEL: Record<QuoteRequestStatus, string> = {
  open: 'Awaiting quotes',
  quoted: 'Quotes in',
  accepted: 'Accepted',
  cancelled: 'Cancelled',
  closed: 'Closed',
};
