import { baseApi } from '@lib/rtk';
import type { PaymentSuccessData } from './types';

const data: PaymentSuccessData = {
  title: 'Booking confirmed!',
  subtitle: 'Your Wedding with Sharma Events is locked in for 28 May 2026.',
  bookingId: 'EVT-2026-8841',
  whatsappNote: 'Confirmation sent on WhatsApp',
  whatNext: [
    { icon: 'chat', title: 'Sharma Events reaches out', desc: 'Your organizer confirms details within 24 hours.' },
    { icon: 'sparkles', title: 'Share your ideas', desc: 'Add inspirations & surprises on the planning board.' },
    { icon: 'list', title: 'Track every step', desc: 'Watch each category come together up to event day.' },
  ],
  ctaLabel: 'Go to event workspace',
  viewLabel: 'View invitation',
  downloadLabel: 'Download brief',
};

export async function fetchPaymentSuccess(): Promise<PaymentSuccessData> {
  await new Promise((r) => setTimeout(r, 150));
  return data;
}
export const paymentSuccessApi = baseApi.injectEndpoints({
  endpoints: (build) => ({ getPaymentSuccess: build.query<PaymentSuccessData, void>({ queryFn: async () => ({ data: await fetchPaymentSuccess() }) }) }),
});
export const { useGetPaymentSuccessQuery } = paymentSuccessApi;
