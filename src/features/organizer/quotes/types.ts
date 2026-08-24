// Organizer-side view of the same MongoDB-backed quote module the customer
// features already model — reuse the raw API types rather than redefining them.
import type { ApiQuotation, QuoteRequestStatus } from '@features/customer/quotes/types';

export type {
  ApiOrganizer,
  ApiLine,
  ApiLineSubItem,
  ApiQuotation,
  QuotationStatus,
  QuoteRequestStatus,
} from '@features/customer/quotes/types';

/** One row of GET /quote/incoming — a request visible to the logged-in organizer. */
export interface ApiIncomingRequest {
  id: string;
  /**
   * Shortened by the API for privacy (`Priya Reddy` → `Priya R.`), because an
   * open request is broadcast to every matched organizer. Empty string when the
   * customer has no name on file.
   */
  customerName: string;
  occasion: string;
  when: string;
  where: string;
  guests: string;
  /** Empty/[] when the request came from the Home hero's quick "Get quotes"
   * draft, which doesn't collect these — only the full Plan wizard does. */
  budget: string;
  categories: string[];
  ideas: string;
  status: QuoteRequestStatus;
  createdAt?: string;
  myQuotation: ApiQuotation | null;
}
