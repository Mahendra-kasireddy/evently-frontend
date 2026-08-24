import type { CategorySpec } from './types';

export const QUOTE_RESPOND_COPY = {
  summaryTitle: 'Quote summary',
  subtotal: 'Subtotal',
  grandTotal: 'Grand total',
  advanceLabel: 'Advance %',
  advanceNow: 'Advance now',
  siteVisitTitle: 'Suggest site visit',
  siteVisitHint: 'Above ₹2L · Tier 3',
  send: 'Send Quote',
  resend: 'Send updated quote',
  preview: 'Preview (customer view)',
  saveDraft: 'Save draft',
  addCategory: 'Add another service',
} as const;

/** Advance splits the design offers; the middle one is the default. */
export const ADVANCE_OPTIONS = [20, 30, 50] as const;

/**
 * The design suggests a site visit for high-value events. Keeping the
 * threshold here (rather than hardcoding it inside the component) means the
 * hint text and the auto-suggestion can never drift apart.
 */
export const SITE_VISIT_THRESHOLD = 200_000;

/**
 * Per-category detail fields, mirroring the design's four expandable cards.
 * Each field maps onto a `subItems[]` entry on the quotation line, so this is
 * presentation only — it introduces no new persisted shape.
 */
export const CATEGORY_SPECS: CategorySpec[] = [
  {
    key: 'food',
    match: ['food', 'catering', 'cater'],
    icon: 'utensils',
    fields: [
      { label: 'Plates', placeholder: '300', numeric: true },
      { label: 'Rate per plate', placeholder: '350', numeric: true },
    ],
    derivePrice: ['Plates', 'Rate per plate'],
    noteLabel: 'Menu items',
  },
  {
    key: 'decor',
    match: ['decor', 'decoration', 'flower', 'floral'],
    icon: 'flower',
    fields: [{ label: 'Theme', placeholder: 'Marigold & rose' }],
  },
  {
    key: 'photography',
    match: ['photo', 'photography', 'video', 'videography', 'film'],
    icon: 'camera',
    fields: [
      { label: 'Photographers', placeholder: '2', numeric: true },
      { label: 'Coverage hours', placeholder: '10', numeric: true },
    ],
    options: { label: 'Deliverables', values: ['Photos', 'Video', 'Album', 'Reel'] },
  },
  {
    key: 'priest',
    match: ['priest', 'pandit', 'pooja', 'puja', 'ritual'],
    icon: 'flame',
    fields: [{ label: 'Rituals', placeholder: 'Muhurtham + homam' }],
  },
  {
    key: 'music',
    match: ['music', 'dj', 'band', 'entertainment'],
    icon: 'music',
    fields: [{ label: 'Setup', placeholder: 'DJ + live band' }],
  },
  {
    key: 'transport',
    match: ['transport', 'travel', 'cab', 'car'],
    icon: 'car',
    fields: [{ label: 'Vehicles', placeholder: '2 sedans + 1 tempo' }],
  },
  {
    key: 'gifting',
    match: ['gift', 'return gift', 'favour', 'favor'],
    icon: 'gift',
    fields: [{ label: 'Item', placeholder: 'Silver coin boxes' }],
  },
];

/** Fallback for a requested category none of the specs recognise. */
export const GENERIC_SPEC: CategorySpec = {
  key: 'other',
  match: [],
  icon: 'sparkles',
  fields: [{ label: 'Details', placeholder: 'What this covers' }],
};

/** Resolves a customer-requested category string to its builder spec. */
export function specForCategory(category: string): CategorySpec {
  const needle = category.trim().toLowerCase();
  return (
    CATEGORY_SPECS.find((spec) => spec.match.some((m) => needle.includes(m))) ?? {
      ...GENERIC_SPEC,
      key: needle.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'other',
    }
  );
}

/** Resolves a saved line item back to its spec, preferring the stored key. */
export function specForLine(key: string, title: string): CategorySpec {
  return CATEGORY_SPECS.find((spec) => spec.key === key) ?? specForCategory(title || key);
}
