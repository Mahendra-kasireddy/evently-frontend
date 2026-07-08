import type {
  ApiQuotation,
  ApiQuoteRequestDetail,
  CompColumn,
  CompRow,
  QuoteCard,
  QuoteTier,
  QuotationStatus,
  QuotesData,
} from './types';

const INR = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

/** ₹1,05,000 — Indian-grouped currency with no decimals. */
export function formatINR(amount: number): string {
  return INR.format(amount || 0);
}

const TIERS: QuoteTier[] = ['Bronze', 'Silver', 'Gold', 'Platinum'];
export function coerceTier(tier: string): QuoteTier {
  return TIERS.includes(tier as QuoteTier) ? (tier as QuoteTier) : 'Silver';
}

const STATUS_LABEL: Record<QuotationStatus, string> = {
  sent: 'New',
  updated: 'Updated',
  accepted: 'Accepted',
  rejected: 'Declined',
  withdrawn: 'Withdrawn',
};
export function quotationStatusLabel(status: QuotationStatus): string {
  return STATUS_LABEL[status] ?? '';
}

/** "2h ago" / "3d ago" / "just now" from an ISO timestamp. */
export function relativeTime(iso?: string): string {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return `${days}d ago`;
}

function shortName(name?: string): string {
  return (name ?? 'Organizer').split(/\s+/)[0] ?? 'Organizer';
}

export function quotationToCard(q: ApiQuotation): QuoteCard {
  const org = q.organizer;
  return {
    id: q.id,
    initials: org?.initials ?? '★',
    name: org?.name ?? 'Organizer',
    avatarColor: org?.avatarColor ?? '#7c5bd6',
    tier: coerceTier(org?.tier ?? 'Silver'),
    received: q.updatedAt || q.createdAt ? `Received ${relativeTime(q.updatedAt ?? q.createdAt)}` : '',
    grandTotal: formatINR(q.grandTotal),
    status: quotationStatusLabel(q.status),
  };
}

/** Builds the comparison-table view model from a request's real quotations. */
export function buildQuotesData(detail: ApiQuoteRequestDetail): QuotesData {
  const quotes = detail.quotations.map(quotationToCard);
  const comparable = detail.quotations.filter((q) => q.status !== 'withdrawn');

  const columns: CompColumn[] = comparable.map((q) => ({
    id: q.id,
    label: shortName(q.organizer?.name),
  }));

  // Union of line titles across quotations, in first-seen order.
  const titles: string[] = [];
  for (const q of comparable) {
    for (const li of q.lineItems) if (!titles.includes(li.title)) titles.push(li.title);
  }

  const rows: CompRow[] = titles.map((title) => {
    const values: Record<string, string> = {};
    for (const q of comparable) {
      const li = q.lineItems.find((l) => l.title === title);
      values[q.id] = li ? formatINR(li.price) : '—';
    }
    return { label: title, values };
  });

  const subtotalRow: CompRow = { label: 'Subtotal', values: {}, summary: true };
  const gstRow: CompRow = { label: 'GST', values: {}, summary: true };
  const grandRow: CompRow = { label: 'Grand total', values: {}, summary: true };
  for (const q of comparable) {
    subtotalRow.values[q.id] = formatINR(q.subtotal);
    gstRow.values[q.id] = formatINR(q.taxAmount);
    grandRow.values[q.id] = formatINR(q.grandTotal);
  }
  if (comparable.length) rows.push(subtotalRow, gstRow, grandRow);

  // Best = lowest grand total among comparable quotations.
  let bestId = '';
  if (comparable.length) {
    const best = comparable.reduce((a, b) => (b.grandTotal < a.grandTotal ? b : a));
    bestId = best.id;
  }

  // Anomaly = a quotation priced well above the median.
  let anomaly = '';
  if (comparable.length >= 2) {
    const totals = comparable.map((q) => q.grandTotal).sort((a, b) => a - b);
    const mid = Math.floor(totals.length / 2);
    const median =
      totals.length % 2 ? totals[mid]! : Math.round((totals[mid - 1]! + totals[mid]!) / 2);
    const highest = comparable.reduce((a, b) => (b.grandTotal > a.grandTotal ? b : a));
    if (median > 0 && highest.grandTotal > median * 1.25) {
      const pct = Math.round(((highest.grandTotal - median) / median) * 100);
      anomaly = `${highest.organizer?.name ?? 'One organizer'}'s total is ${pct}% above the median of these quotes.`;
    }
  }

  const where = detail.where ? ` · ${detail.where}` : '';
  return {
    eyebrow: `QUOTES FOR YOUR ${detail.occasion.toUpperCase()}${where}`.trim(),
    heading: 'Compare quotes, pick your best fit',
    subtitle: comparable.length
      ? `${comparable.length} ${comparable.length === 1 ? 'organizer' : 'organizers'} replied. Compare line by line — we flag anything priced above the median.`
      : 'No quotations yet. Organizers you requested will reply here soon.',
    quotes,
    columns,
    rows,
    bestId,
    anomaly,
  };
}
