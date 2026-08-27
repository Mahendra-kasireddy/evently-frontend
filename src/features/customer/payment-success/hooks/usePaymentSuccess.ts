import { useGetBookingQuery } from '../service';
import type { PaymentSuccessData } from '../types';
import { WHAT_NEXT } from '../constants';

function eventDateLabel(iso?: string): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function usePaymentSuccess(id: string) {
  const { data: booking, isLoading, isError, refetch } = useGetBookingQuery(id, { skip: !id });

  const data: PaymentSuccessData | undefined = booking
    ? {
        /*
         * Payment succeeding is not the organizer confirming. Saying "Booking
         * confirmed!" here is what made the detail screen's "Pending" badge read
         * as a bug — the two screens were describing different things.
         */
        title: 'Advance paid',
        subtitle: `We've sent your ${booking.occasion || 'event'}${
          booking.eventDate ? ` on ${eventDateLabel(booking.eventDate)}` : ''
        } to ${booking.organizer?.name ?? 'your organizer'} to confirm.`,
        bookingId: booking.ref,
        whatsappNote: 'Confirmation sent to your notifications',
        whatNext: WHAT_NEXT,
        ctaLabel: 'Go to event workspace',
        viewLabel: 'View booking',
        downloadLabel: 'Download brief',
      }
    : undefined;

  return { data, bookingId: booking?.id, isLoading, isError, refetch };
}
