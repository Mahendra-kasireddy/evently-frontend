import { apiClient } from '@lib/api';
import { baseApi, toQueryResult } from '@lib/rtk';
import type { City } from './types';

/**
 * Join/role-selection data.
 *
 * Exactly one thing on this screen is fetched: the city list. It comes from
 * `plan_cities` — the same collection the Plan Event wizard and organizer
 * onboarding read — via the public `GET /plan/cities`.
 *
 * The two role cards are static product copy (headline, description and the
 * illustrative "214 events / 4.8★" figures the marketing surfaces use, the same
 * convention as `landing/service.ts`), so they live in `constants.ts` instead of
 * being faked as a network round-trip.
 */

/** `plan_cities`, same collection the Plan Event wizard and organizer onboarding read. */
async function fetchCities(): Promise<City[]> {
  const { data } = await apiClient.get<string[]>('/plan/cities');
  return data.map((name) => ({ id: name.toLowerCase().replace(/\s+/g, '-'), name }));
}

/** RTK Query endpoints (aliased back to useCities in ./hooks). */
export const joinApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCities: build.query<City[], void>({
      queryFn: () => toQueryResult(() => fetchCities()),
    }),
  }),
});

export const { useGetCitiesQuery } = joinApi;
