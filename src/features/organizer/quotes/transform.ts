import { formatINR, quotationStatusLabel, relativeTime } from '@features/customer/quotes/transform';
import type { ApiIncomingRequest } from './types';

export { formatINR, relativeTime };

/** "Awaiting your quote" / the quotation's own status label, for the request card. */
export function myStatusLabel(request: ApiIncomingRequest): string {
  return request.myQuotation ? quotationStatusLabel(request.myQuotation.status) : 'Awaiting your quote';
}
