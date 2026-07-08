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
        title: 'Booking confirmed!',
        subtitle: `Your ${booking.occasion || 'event'} with ${booking.organizer?.name ?? 'your organizer'} is booked${
          booking.eventDate ? ` for ${eventDateLabel(booking.eventDate)}` : ''
        }.`,
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
