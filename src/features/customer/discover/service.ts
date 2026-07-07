import { baseApi } from '@lib/rtk';
import type { DiscoverData } from './types';

const data: DiscoverData = {
  eyebrow: 'DISCOVER · HYDERABAD',
  heading: 'Find your perfect organizer',
  subtitle: 'Browse verified, certified and rated organizers near you. Compare, view profiles, and request quotes.',
  organizers: [
    { id: 'sharma', initials: 'SE', name: 'Sharma Events', avatarColor: '#7c5bd6', tier: 'Gold', rating: 4.8, reviews: 128, events: 214, location: 'Banjara Hills', tags: ['Catering', 'Decor', 'Photography'], matches: 6, total: 6, estRange: '₹2.4L – 3.2L' },
    { id: 'telugu', initials: 'TV', name: 'Telugu Vibes', avatarColor: '#1d9e75', tier: 'Platinum', rating: 4.9, reviews: 201, events: 340, location: 'Jubilee Hills', tags: ['Full service', 'Decor'], matches: 6, total: 6, estRange: '₹2.8L – 4.1L' },
    { id: 'ravi', initials: 'RE', name: 'Ravi Events', avatarColor: '#1a2e5a', tier: 'Silver', rating: 4.6, reviews: 82, events: 96, location: 'Gachibowli', tags: ['Photography', 'Music'], matches: 6, total: 6, estRange: '₹1.8L – 2.6L' },
    { id: 'mangala', initials: 'MC', name: 'Mangala Celebrations', avatarColor: '#c2502a', tier: 'Gold', rating: 4.7, reviews: 154, events: 178, location: 'Kukatpally', tags: ['Catering', 'Priest'], matches: 6, total: 6, estRange: '₹2.2L – 3.0L' },
    { id: 'royal', initials: 'RO', name: 'Royal Occasions', avatarColor: '#b8860b', tier: 'Platinum', rating: 4.8, reviews: 167, events: 220, location: 'Madhapur', tags: ['Decor', 'Lighting'], matches: 6, total: 6, estRange: '₹3.0L – 4.5L' },
    { id: 'pearl', initials: 'PE', name: 'Pearl Events', avatarColor: '#0f766e', tier: 'Silver', rating: 4.5, reviews: 64, events: 71, location: 'Kondapur', tags: ['Catering', 'Music'], matches: 6, total: 6, estRange: '₹1.5L – 2.3L' },
  ],
  filters: {
    tiers: ['Bronze', 'Silver', 'Gold', 'Platinum'],
    ratings: ['4.0+', '4.5+', '4.8+'],
    categories: ['Catering', 'Decoration', 'Photography', 'Music & Sound'],
    sorts: ['Sort: Rating', 'Price', 'Most events', '4.5+ ★'],
  },
};

export async function fetchDiscover(): Promise<DiscoverData> {
  await new Promise((r) => setTimeout(r, 200));
  return data;
}
export const discoverApi = baseApi.injectEndpoints({
  endpoints: (build) => ({ getDiscover: build.query<DiscoverData, void>({ queryFn: async () => ({ data: await fetchDiscover() }) }) }),
});
export const { useGetDiscoverQuery } = discoverApi;
