import { baseApi } from '@lib/rtk';
import type { QuoteDetail } from './types';

const base: QuoteDetail = {
  id: 'sharma', initials: 'SE', name: 'Sharma Events', avatarColor: '#7c5bd6', tier: 'Gold',
  rating: 4.8, reviews: 128, receivedLabel: 'Quote received 2h ago', status: 'New',
  items: [
    { id: 'food', icon: 'food', title: 'Food / Catering', subtitle: '300 plates × ₹350', price: '₹1,05,000',
      subItems: [{ label: 'Veg deluxe thali', value: '300 × ₹350' }, { label: 'Welcome drinks', value: 'Included' }, { label: 'Live counters', value: '2 stations' }],
      note: 'Menu can be customised at the tasting session. Paneer & biryani included.' },
    { id: 'water', icon: 'water', title: 'Drinking Water', subtitle: '400 bottles × ₹15', price: '₹6,000',
      subItems: [{ label: 'Branded 500ml bottles', value: '400 × ₹15' }] },
    { id: 'decor', icon: 'decor', title: 'Decoration', subtitle: 'Theme + florals', price: '₹45,000',
      subItems: [{ label: 'Stage & mandap', value: 'Included' }, { label: 'Fresh florals', value: 'Marigold & rose' }] },
    { id: 'photo', icon: 'photo', title: 'Photography & Video', subtitle: 'Full coverage', price: '₹35,000',
      subItems: [{ label: 'Candid + traditional', value: '2 shooters' }, { label: 'Edited album', value: '+ reel' }] },
  ],
  subtotal: '₹1,91,000', gst: '₹34,380', gstLabel: 'GST (18%)', grandTotal: '₹2,84,600', grandNote: 'incl. 18% GST',
  advanceLabel: 'Advance (30%)', advance: '₹85,380', balanceLabel: 'Balance later', balance: '₹1,99,220',
  footnote: 'Advance is held securely. Balance is due only after your event is delivered.',
};

const QUOTES: Record<string, QuoteDetail> = {
  sharma: base,
  telugu: { ...base, id: 'telugu', initials: 'TV', name: 'Telugu Vibes', avatarColor: '#1d9e75', tier: 'Platinum', grandTotal: '₹3,12,000', advance: '₹93,600', balance: '₹2,18,400' },
  ravi: { ...base, id: 'ravi', initials: 'RE', name: 'Ravi Events', avatarColor: '#1a2e5a', tier: 'Silver', grandTotal: '₹2,46,800', advance: '₹74,040', balance: '₹1,72,760' },
};

export async function fetchQuoteDetail(id: string): Promise<QuoteDetail> {
  await new Promise((r) => setTimeout(r, 200));
  return QUOTES[id] ?? base;
}

export const quoteDetailApi = baseApi.injectEndpoints({
  endpoints: (build) => ({ getQuoteDetail: build.query<QuoteDetail, string>({ queryFn: async (id) => ({ data: await fetchQuoteDetail(id) }) }) }),
});
export const { useGetQuoteDetailQuery } = quoteDetailApi;
