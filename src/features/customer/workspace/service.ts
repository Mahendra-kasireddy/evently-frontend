/**
 * Workspace data layer. All content is real, MongoDB-backed data pulled through
 * existing RTK Query endpoints — no mock JSON. The workspace shows the
 * customer's own plans, quote requests, and bookings.
 */
export { useGetMyPlansQuery, useGetMyQuotesQuery } from '@features/customer/plan/service';
export { useGetMyBookingsQuery } from '@features/customer/booking/service';
