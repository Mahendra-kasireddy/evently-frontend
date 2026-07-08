import type {
  PlanSubmission,
  PlanQuoteRequest,
  PlanStatus,
  QuoteRequestStatus,
} from '@features/customer/plan/types';
import type { ApiBooking } from '@features/customer/booking/types';

export type { PlanSubmission, PlanQuoteRequest, PlanStatus, QuoteRequestStatus, ApiBooking };

/** Real workspace data — the customer's plans, quote requests, and bookings. */
export interface WorkspaceData {
  plans: PlanSubmission[];
  quotes: PlanQuoteRequest[];
  bookings: ApiBooking[];
}
