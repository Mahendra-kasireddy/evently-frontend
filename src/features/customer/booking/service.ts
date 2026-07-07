import { baseApi } from '@lib/rtk';
import type { BookingData } from './types';

const data: BookingData = {
  eyebrow: 'BOOKING · SHARMA EVENTS',
  heading: 'Confirm & secure your date',
  subtitle: 'Pay a 30% advance to lock 28 May 2026. The balance is due only after your event is delivered.',
  methods: [
    { id: 'upi', label: 'UPI · PhonePe / GPay / Paytm', icon: 'upi' },
    { id: 'card', label: 'Debit / Credit card', icon: 'card' },
  ],
  securedNote: 'Secured by Razorpay · 256-bit encryption',
  cancellation: 'Free cancellation up to 30 days before the event. 50% refund within 30–15 days. The advance is non-refundable within 15 days of the event date.',
  payNowLabel: 'PAY NOW (30%)',
  payNow: '₹85,380',
  balanceNote: 'Balance ₹1,99,220 · due after your event',
  summary: [
    { label: 'Event', value: 'Wedding · 28 May 2026' },
    { label: 'Organizer', value: 'Sharma Events' },
    { label: 'Venue', value: 'Banjara Hills, Hyderabad' },
    { label: 'Categories', value: 'Food, Decor, Photo, Priest' },
  ],
  grandTotal: '₹2,84,600',
  confirmLabel: 'Confirm & Pay ₹85,380',
  footnote: 'Your advance is protected. Balance releases to the organizer only after your event is delivered.',
};

export async function fetchBooking(): Promise<BookingData> {
  await new Promise((r) => setTimeout(r, 200));
  return data;
}

export const bookingApi = baseApi.injectEndpoints({
  endpoints: (build) => ({ getBooking: build.query<BookingData, void>({ queryFn: async () => ({ data: await fetchBooking() }) }) }),
});
export const { useGetBookingQuery } = bookingApi;
