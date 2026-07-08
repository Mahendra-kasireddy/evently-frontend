import type { PaymentMethod } from './types';

export const BOOKING_ROUTE = '/booking';

/** UI-only payment presentation (the app does not process payments). */
export const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'upi', label: 'UPI · PhonePe / GPay / Paytm', icon: 'upi' },
  { id: 'card', label: 'Debit / Credit card', icon: 'card' },
];
export const SECURED_NOTE = 'Secured by Razorpay · 256-bit encryption';
export const CANCELLATION_POLICY =
  'Free cancellation up to 30 days before the event. 50% refund within 30–15 days. The advance is non-refundable within 15 days of the event date.';
export const BOOKING_FOOTNOTE =
  'Your advance is protected. Balance releases to the organizer only after your event is delivered.';
