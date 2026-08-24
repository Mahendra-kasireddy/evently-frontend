import { apiClient } from '@lib/api';
import { baseApi, toQueryResult } from '@lib/rtk';
import type { PlanOrganizer } from '@features/customer/plan/types';

/** Raw shape of GET /organizer/getTopOrganizers — the backend's sanitized public view. */
interface ApiPublicOrganizer {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  tier: string;
  rating: number;
  reviews: number;
  events: number;
  tags: string[];
  location: string;
  estRange: string;
  concierge: boolean;
}

/** Maps the public organizer view to the same PlanOrganizer shape FindOrganizers
 * already renders. `matches`/`total` are recommendation-engine fields with no
 * meaning in a plain browse listing — set to the organizer's own tag count so
 * the "Matches N of N" badge reflects a real (if trivial) number, not a made-up one. */
function toPlanOrganizer(o: ApiPublicOrganizer): PlanOrganizer {
  return {
    id: o.id,
    initials: o.initials,
    name: o.name,
    avatarColor: o.avatarColor,
    tier: (['Bronze', 'Silver', 'Gold', 'Platinum'] as const).includes(o.tier as never)
      ? (o.tier as PlanOrganizer['tier'])
      : 'Silver',
    rating: o.rating,
    reviews: o.reviews,
    events: o.events,
    location: o.location,
    tags: o.tags,
    matches: o.tags.length,
    total: o.tags.length,
    estRange: o.estRange,
    concierge: o.concierge,
  };
}

async function fetchDiscoverOrganizers(): Promise<PlanOrganizer[]> {
  const { data } = await apiClient.get<ApiPublicOrganizer[]>('/organizer/getTopOrganizers', {
    params: { limit: 50 },
  });
  return data.map(toPlanOrganizer);
}

/** Discover's organizer listing — 100% MongoDB-backed, no mock data. */
export const discoverApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getDiscoverOrganizers: build.query<PlanOrganizer[], void>({
      queryFn: () => toQueryResult(fetchDiscoverOrganizers),
    }),
  }),
});

export const { useGetDiscoverOrganizersQuery } = discoverApi;
