import type { ApiQuotation } from '@features/customer/quotes/types';
import {
  coerceTier,
  formatINR,
  quotationStatusLabel,
  relativeTime,
} from '@features/customer/quotes/transform';
import type { LineIcon, LineItem, QuoteDetail } from './types';

const KEY_ICON: Record<string, LineIcon> = {
  food: 'food',
  water: 'water',
  decoration: 'decor',
  decor: 'decor',
  photography: 'photo',
  photo: 'photo',
  music: 'music',
};
function iconFor(key: string): LineIcon {
  return KEY_ICON[key] ?? 'other';
}

/** Maps a MongoDB-backed quotation into the quote-detail view model. */
export function quotationToDetail(q: ApiQuotation): QuoteDetail {
  const org = q.organizer;
  const items: LineItem[] = q.lineItems.map((li, i) => ({
    id: `${li.key || li.title || 'item'}-${i}`,
    icon: iconFor(li.key),
    title: li.title,
    subtitle: li.subtitle,
    price: formatINR(li.price),
    subItems: li.subItems.map((s) => ({ label: s.label, value: s.value })),
    ...(li.note ? { note: li.note } : {}),
  }));

  const advance = Math.round(q.grandTotal * 0.3);
  const balance = q.grandTotal - advance;

  return {
    id: q.id,
    initials: org?.initials ?? '★',
    name: org?.name ?? 'Organizer',
    avatarColor: org?.avatarColor ?? '#7c5bd6',
    tier: coerceTier(org?.tier ?? 'Silver'),
    rating: org?.rating ?? 0,
    reviews: org?.reviews ?? 0,
    receivedLabel: `Quote received ${relativeTime(q.updatedAt ?? q.createdAt)}`,
    status: quotationStatusLabel(q.status),
    items,
    subtotal: formatINR(q.subtotal),
    gst: formatINR(q.taxAmount),
    gstLabel: `GST (${q.taxRate}%)`,
    grandTotal: formatINR(q.grandTotal),
    grandNote: `incl. ${q.taxRate}% GST`,
    advanceLabel: 'Advance (30%)',
    advance: formatINR(advance),
    balanceLabel: 'Balance later',
    balance: formatINR(balance),
    footnote: 'Advance is held securely. Balance is due only after your event is delivered.',
  };
}
