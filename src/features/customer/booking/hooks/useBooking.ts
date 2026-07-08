import { useGetQuotationQuery } from '@features/customer/quotes/service';
import { formatINR } from '@features/customer/quotes/transform';
import type { ApiQuotation } from '@features/customer/quotes/types';
import type { BookingData } from '../types';
import {
  BOOKING_FOOTNOTE,
  CANCELLATION_POLICY,
  PAYMENT_METHODS,
  SECURED_NOTE,
} from '../constants';

/**
 * Loads the accepted quotation and derives the checkout view from it — real,
 * MongoDB-backed amounts and summary. UI copy (methods, policy) is static.
 */
export function useBooking(quotationId: string) {
  const { data: q, isLoading, isError, refetch } = useGetQuotationQuery(quotationId, {
    skip: !quotationId,
  });

  const data: BookingData | undefined = q ? buildCheckout(q) : undefined;
  return { data, isLoading, isError, refetch };
}

function buildCheckout(q: ApiQuotation): BookingData {
  const advance = Math.round(q.grandTotal * 0.3);
  const balance = q.grandTotal - advance;
  const orgName = q.organizer?.name ?? 'your organizer';
  const categories = q.lineItems.map((l) => l.title.split(/[ /]/)[0]).join(', ');

  return {
    eyebrow: `BOOKING · ${orgName.toUpperCase()}`,
    heading: 'Confirm & secure your date',
    subtitle: `Pay a 30% advance to lock in your booking with ${orgName}. The balance is due only after your event is delivered.`,
    methods: PAYMENT_METHODS,
    securedNote: SECURED_NOTE,
    cancellation: CANCELLATION_POLICY,
    payNowLabel: 'PAY NOW (30%)',
    payNow: formatINR(advance),
    balanceNote: `Balance ${formatINR(balance)} · due after your event`,
    summary: [
      { label: 'Organizer', value: orgName },
      ...(categories ? [{ label: 'Categories', value: categories }] : []),
      { label: 'Subtotal', value: formatINR(q.subtotal) },
      { label: `GST (${q.taxRate}%)`, value: formatINR(q.taxAmount) },
    ],
    grandTotal: formatINR(q.grandTotal),
    confirmLabel: `Confirm & Pay ${formatINR(advance)}`,
    footnote: BOOKING_FOOTNOTE,
  };
}
