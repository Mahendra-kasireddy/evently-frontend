import { useGetQuotationQuery, useGetQuoteRequestQuery } from '@features/customer/quotes/service';
import { formatINR } from '@features/customer/quotes/transform';
import type { ApiQuotation, ApiQuoteRequestDetail } from '@features/customer/quotes/types';
import type { BookingData } from '../types';
import {
  BOOKING_FOOTNOTE,
  CANCELLATION_POLICY,
  PAYMENT_METHODS,
  SECURED_NOTE,
} from '../constants';

/**
 * Loads the accepted quotation plus the request it answers, and derives the
 * checkout view from both — real, MongoDB-backed amounts and event context.
 * UI copy (methods, policy) is static.
 */
export function useBooking(quotationId: string) {
  const quotationQ = useGetQuotationQuery(quotationId, { skip: !quotationId });
  const q = quotationQ.data;
  // Occasion, date and venue live on the request, not on the quotation.
  const requestQ = useGetQuoteRequestQuery(q?.requestId ?? '', { skip: !q?.requestId });

  const data: BookingData | undefined = q ? buildCheckout(q, requestQ.data) : undefined;
  return {
    data,
    isLoading: quotationQ.isLoading || (!!q?.requestId && requestQ.isLoading && !requestQ.data),
    isError: quotationQ.isError,
    refetch: () => {
      void quotationQ.refetch();
      if (q?.requestId) void requestQ.refetch();
    },
  };
}

function buildCheckout(q: ApiQuotation, request: ApiQuoteRequestDetail | undefined): BookingData {
  /*
   * The advance comes from the quotation, never a hardcoded 30%: organizers can
   * quote 20/30/50% in the builder, and `advanceAmount` is computed server-side
   * so the builder, the quote detail and this checkout can never disagree about
   * what the customer is charged.
   */
  const pct = q.advancePercentage || 30;
  const advance = q.advanceAmount || Math.round((q.grandTotal * pct) / 100);
  const balance = Math.max(0, q.grandTotal - advance);
  const orgName = q.organizer?.name ?? 'your organizer';
  const categories = q.lineItems.map((l) => l.title.split(/[ /]/)[0]).join(', ');

  const when = request?.when?.trim() ?? '';
  const occasion = request?.occasion?.trim() ?? '';
  const venue = request?.where?.trim() ?? '';
  const eventValue = [occasion, when].filter(Boolean).join(' · ');

  return {
    eyebrow: `BOOKING · ${orgName.toUpperCase()}`,
    heading: 'Confirm & secure your date',
    subtitle: when
      ? `Pay a ${pct}% advance to lock ${when}. The balance is due only after your event is delivered.`
      : `Pay a ${pct}% advance to lock in your booking with ${orgName}. The balance is due only after your event is delivered.`,
    methods: PAYMENT_METHODS,
    securedNote: SECURED_NOTE,
    cancellation: CANCELLATION_POLICY,
    payNowLabel: `PAY NOW (${pct}%)`,
    payNow: formatINR(advance),
    balanceNote: `Balance ${formatINR(balance)} · due after your event`,
    summary: [
      ...(eventValue ? [{ label: 'Event', value: eventValue }] : []),
      { label: 'Organizer', value: orgName },
      ...(venue ? [{ label: 'Venue', value: venue }] : []),
      ...(categories ? [{ label: 'Categories', value: categories }] : []),
      { label: 'Subtotal', value: formatINR(q.subtotal) },
      { label: `GST (${q.taxRate}%)`, value: formatINR(q.taxAmount) },
    ],
    grandTotal: formatINR(q.grandTotal),
    confirmLabel: `Confirm & Pay ${formatINR(advance)}`,
    footnote: BOOKING_FOOTNOTE,
  };
}
