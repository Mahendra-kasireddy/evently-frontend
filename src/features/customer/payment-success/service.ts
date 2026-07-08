/**
 * Booking-confirmation data layer. Reuses the MongoDB-backed booking endpoint —
 * the confirmation reads the real booking that was just created. No mock data.
 */
export { useGetBookingQuery } from '@features/customer/booking/service';
