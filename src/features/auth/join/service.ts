import { baseApi, toQueryResult } from '@lib/rtk';
import type { City, JoinRole } from './types';

/**
 * Join/role-selection data. Mock today; swap each body for the apiClient call
 * (e.g. apiClient.get<JoinRole[]>('/auth/roles')) when the backend is ready.
 */
const mockRoles: JoinRole[] = [
  { id: 'organizer', to: '/onboarding/organizer', tone: 'organizer', icon: 'briefcase', title: "I'm an Organizer",
    description: 'Manage bookings, coordinate sub-vendors, build your event business — all from one dashboard.',
    cta: 'Get started', badge: 'Gold',
    stats: [{ label: 'Events', value: '214' }, { label: 'Rating', value: '4.8★' }, { label: 'Tier', value: 'Gold' }],
  },
  { id: 'subvendor', to: '/onboarding/subvendor', tone: 'subvendor', icon: 'truck', title: "I'm a Sub-vendor",
    description: 'Accept tasks from organizers, deliver your services, and get paid automatically — no chasing needed.',
    cta: 'Get started', badge: 'Score 92',
    stats: [{ label: 'Tasks', value: '48' }, { label: 'Earned', value: '₹2.1L' }, { label: 'Score', value: '92/100' }],
  },
];
const mockCities: City[] = [
  { id: 'hyd', name: 'Hyderabad' }, { id: 'vij', name: 'Vijayawada' },
  { id: 'blr', name: 'Bangalore' }, { id: 'che', name: 'Chennai' },
  { id: 'more', name: '+ more cities' },
];

export async function getRoles(): Promise<JoinRole[]> {
  await new Promise((r) => setTimeout(r, 200));
  return mockRoles;
}
export async function getCities(): Promise<City[]> {
  await new Promise((r) => setTimeout(r, 200));
  return mockCities;
}

/** RTK Query endpoints (aliased back to useRoles/useCities in ./hooks). */
export const joinApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getRoles: build.query<JoinRole[], void>({
      queryFn: () => toQueryResult(() => getRoles()),
    }),
    getCities: build.query<City[], void>({
      queryFn: () => toQueryResult(() => getCities()),
    }),
  }),
});

export const { useGetRolesQuery, useGetCitiesQuery } = joinApi;
