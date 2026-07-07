import { baseApi } from '@lib/rtk';
import type { OrganizerProfile } from './types';

const sharma: OrganizerProfile = {
  id: 'sharma', initials: 'SE', name: 'Sharma Events', avatarColor: '#7c5bd6', tier: 'Gold',
  rating: 4.8, reviews: 128, location: 'Hyderabad', certified: true,
  stats: [
    { value: '214', label: 'Events' },
    { value: '< 2 hrs', label: 'Response' },
    { value: '7 yrs', label: 'Active' },
    { value: '38%', label: 'Repeat' },
  ],
  about: 'Full-service wedding & celebration specialists serving Hyderabad for 7 years. We coordinate catering, decor, photography and priests under one trusted roof.',
  serviceArea: 'Serves 15km · Banjara Hills',
  portfolio: [
    { id: 'p1', color: '#f7e7e7' }, { id: 'p2', color: '#e3efe8' }, { id: 'p3', color: '#e7ebf3' },
    { id: 'p4', color: '#f6efd9' }, { id: 'p5', color: '#ece7f5' }, { id: 'p6', color: '#f5e6da' },
  ],
  reviewsList: [
    { id: 'r1', initials: 'AV', avatarColor: '#1d9e75', name: 'Anjali Verma', meta: 'Wedding · Apr 2026', rating: 5, text: 'Flawless coordination. The decor was exactly what we dreamed of.', reply: 'Thank you Anjali! It was a joy working with your family.' },
    { id: 'r2', initials: 'KR', avatarColor: '#1a2e5a', name: 'Karthik Rao', meta: 'Anniversary · Mar 2026', rating: 5, text: 'Great food and on-time service. Would book again.' },
  ],
  estLabel: 'Est. for your Wedding',
  estRange: '₹2.4L – 3.2L',
};

const PROFILES: Record<string, OrganizerProfile> = {
  sharma,
  telugu: { ...sharma, id: 'telugu', initials: 'TV', name: 'Telugu Vibes', avatarColor: '#1d9e75', tier: 'Platinum', rating: 4.9, reviews: 201, estRange: '₹2.8L – 4.1L' },
  ravi: { ...sharma, id: 'ravi', initials: 'RE', name: 'Ravi Events', avatarColor: '#1a2e5a', tier: 'Silver', rating: 4.6, reviews: 82, estRange: '₹1.8L – 2.6L' },
  mangala: { ...sharma, id: 'mangala', initials: 'MC', name: 'Mangala Celebrations', avatarColor: '#c2502a', tier: 'Gold', rating: 4.7, reviews: 154, estRange: '₹2.2L – 3.0L' },
};

export async function fetchProfile(id: string): Promise<OrganizerProfile> {
  await new Promise((r) => setTimeout(r, 200));
  return PROFILES[id] ?? sharma;
}

export const profileApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getOrganizerProfile: build.query<OrganizerProfile, string>({
      queryFn: async (id) => ({ data: await fetchProfile(id) }),
    }),
  }),
});
export const { useGetOrganizerProfileQuery } = profileApi;
