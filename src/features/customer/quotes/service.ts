import { baseApi } from '@lib/rtk';
import type { QuotesData } from './types';

const data: QuotesData = {
  eyebrow: 'QUOTES FOR YOUR WEDDING · 28 MAY 2026',
  heading: 'Compare quotes, pick your best fit',
  subtitle: '3 organizers replied. Compare line by line — we flag anything priced above the city average.',
  quotes: [
    { id: 'sharma', initials: 'SE', name: 'Sharma Events', avatarColor: '#7c5bd6', tier: 'Gold', received: 'Received 2h ago', grandTotal: '₹2,84,600', status: 'New' },
    { id: 'telugu', initials: 'TV', name: 'Telugu Vibes', avatarColor: '#1d9e75', tier: 'Platinum', received: 'Received 5h ago', grandTotal: '₹3,12,000', status: 'Reviewed' },
    { id: 'ravi', initials: 'RE', name: 'Ravi Events', avatarColor: '#1a2e5a', tier: 'Silver', received: 'Received 1d ago', grandTotal: '₹2,46,800', status: '' },
  ],
  columns: [
    { id: 'sharma', label: 'Sharma' },
    { id: 'telugu', label: 'Telugu Vibes' },
    { id: 'ravi', label: 'Ravi' },
  ],
  rows: [
    { label: 'Food (300 plates)', values: { sharma: '₹1,05,000', telugu: '₹1,32,000', ravi: '₹98,000' } },
    { label: 'Water (400 bottles)', values: { sharma: '₹6,000', telugu: '₹6,000', ravi: '₹5,600' } },
    { label: 'Decoration', values: { sharma: '₹45,000', telugu: '₹52,000', ravi: '₹41,000' } },
    { label: 'Photography', values: { sharma: '₹35,000', telugu: '₹38,000', ravi: '₹33,000' } },
    { label: 'Subtotal', values: { sharma: '₹1,91,000', telugu: '₹2,28,000', ravi: '₹1,77,600' }, summary: true },
    { label: 'GST 18%', values: { sharma: '₹34,380', telugu: '₹41,040', ravi: '₹31,968' }, summary: true },
    { label: 'Grand total', values: { sharma: '₹2,84,600', telugu: '₹3,12,000', ravi: '₹2,46,800' }, summary: true },
  ],
  bestId: 'telugu',
  anomaly: "Telugu Vibes' food rate is 38% above the Hyderabad city average.",
};

export async function fetchQuotes(): Promise<QuotesData> {
  await new Promise((r) => setTimeout(r, 200));
  return data;
}

export const quotesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({ getQuotes: build.query<QuotesData, void>({ queryFn: async () => ({ data: await fetchQuotes() }) }) }),
});
export const { useGetQuotesQuery } = quotesApi;
