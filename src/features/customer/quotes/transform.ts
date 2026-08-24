import type {
  ApiLine,
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
  // Only ever seen by the authoring organizer — the API hides drafts from customers.
  draft: 'Draft',
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

  /*
   * Rows are grouped by line `key` (food, decor, photo…) rather than by title,
   * because two organizers quoting the same service rarely word it the same way
   * — "Food / Catering" vs "Food (300 plates)". Grouping on the title produced
   * a sparse table of half-empty rows that could not be compared at all.
   * Lines with no key fall back to a normalised title.
   */
  const groupKey = (li: ApiLine): string =>
    (li.key || li.title).trim().toLowerCase().replace(/[^a-z0-9]+/g, '');

  const order: string[] = [];
  const labels = new Map<string, string>();
  for (const q of comparable) {
    for (const li of q.lineItems) {
      const k = groupKey(li);
      if (!order.includes(k)) {
        order.push(k);
        labels.set(k, li.title);
      }
    }
  }

  const rows: CompRow[] = order.map((k) => {
    const values: Record<string, string> = {};
    const amounts: Record<string, number> = {};
    for (const q of comparable) {
      // Same key quoted twice by one organizer (rare) is summed, not dropped.
      const lines = q.lineItems.filter((l) => groupKey(l) === k);
      if (lines.length === 0) {
        values[q.id] = '—';
        continue;
      }
      const price = lines.reduce((s, l) => s + (l.price || 0), 0);
      amounts[q.id] = price;
      values[q.id] = formatINR(price);
    }
    return { label: labels.get(k) ?? k, values, amounts };
  });

  const taxRate = comparable[0]?.taxRate;
  const gstLabel = comparable.every((q) => q.taxRate === taxRate) && taxRate
    ? `GST ${taxRate}%`
    : 'GST';
  const subtotalRow: CompRow = { label: 'Subtotal', values: {}, amounts: {}, summary: true };
  const gstRow: CompRow = { label: gstLabel, values: {}, amounts: {}, summary: true };
  const grandRow: CompRow = {
    label: 'Grand total',
    values: {},
    amounts: {},
    summary: true,
    total: true,
  };
  for (const q of comparable) {
    subtotalRow.values[q.id] = formatINR(q.subtotal);
    subtotalRow.amounts[q.id] = q.subtotal;
    gstRow.values[q.id] = formatINR(q.taxAmount);
    gstRow.amounts[q.id] = q.taxAmount;
    grandRow.values[q.id] = formatINR(q.grandTotal);
    grandRow.amounts[q.id] = q.grandTotal;
  }
  if (comparable.length) rows.push(subtotalRow, gstRow, grandRow);

  // Best = lowest grand total among comparable quotations.
  let bestId = '';
  if (comparable.length) {
    const best = comparable.reduce((a, b) => (b.grandTotal < a.grandTotal ? b : a));
    bestId = best.id;
  }

  /*
   * Anomaly, per line item rather than per total: a single service priced far
   * above what the others charge for the same thing is what a customer can act
   * on ("their food rate is 38% higher"), where a higher total may just mean a
   * bigger package. Reported against the median so one outlier can't skew it.
   */
  let anomaly = '';
  if (comparable.length >= 2) {
    let worst: { name: string; label: string; pct: number } | null = null;
    for (const row of rows) {
      if (row.summary) continue;
      const priced = Object.entries(row.amounts).filter(([, v]) => v > 0);
      if (priced.length < 2) continue;
      const sorted = priced.map(([, v]) => v).sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      const median =
        sorted.length % 2 ? sorted[mid]! : Math.round((sorted[mid - 1]! + sorted[mid]!) / 2);
      if (median <= 0) continue;
      const [topId, topValue] = priced.reduce((a, b) => (b[1] > a[1] ? b : a));
      const pct = Math.round(((topValue - median) / median) * 100);
      if (pct >= 25 && (!worst || pct > worst.pct)) {
        const org = comparable.find((q) => q.id === topId)?.organizer?.name ?? 'One organizer';
        worst = { name: org, label: row.label.toLowerCase(), pct };
      }
    }
    if (worst) {
      anomaly = `${worst.name}’s ${worst.label} price is ${worst.pct}% above the median of these quotes.`;
    }
  }

  /*
   * Which event these quotes belong to, stated as specifically as the request
   * allows: occasion, date, place, guest count. The customer arrives here from a
   * named event card in My Events, so the screen has to confirm it opened the
   * right one. Blank fields are dropped rather than rendered as empty separators.
   */
  const eyebrow = [
    `QUOTES FOR YOUR ${detail.occasion.toUpperCase()}`,
    detail.when,
    detail.where,
    detail.guests ? `${detail.guests} guests` : '',
  ]
    .map((part) => (part ?? '').trim())
    .filter(Boolean)
    .join(' · ');

  return {
    eyebrow,
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
