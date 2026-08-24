import { apiClient } from '@lib/api';
import { baseApi, toQueryResult } from '@lib/rtk';
import type { OrganizerProfile, ProfileTier, ProfileTile } from './types';

/** Subset of GET /organizer/getOrganizerById/:id (the backend's sanitized public view) this page reads. */
interface ApiPublicOrganizer {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  tier: string;
  rating: number;
  reviews: number;
  events: number;
  location: string;
  serviceAreas: string[];
  responseHours: number;
  yearsOfExperience: number;
  businessDescription: string;
  estRange: string;
  coverPhoto: { url: string } | null;
  gallery: { key: string; url: string }[];
}

const TIERS: ProfileTier[] = ['Bronze', 'Silver', 'Gold', 'Platinum'];
function coerceTier(tier: string): ProfileTier {
  return (TIERS as string[]).includes(tier) ? (tier as ProfileTier) : 'Silver';
}

/** Real portfolio images only — no fabricated placeholder tiles. Falls back
 * to the cover photo alone if the gallery is empty, or nothing at all. */
function buildPortfolio(o: ApiPublicOrganizer): ProfileTile[] {
  if (o.gallery.length > 0) {
    return o.gallery.map((g) => ({ id: g.key, color: '#eef1f7', image: g.url }));
  }
  if (o.coverPhoto?.url) {
    return [{ id: 'cover', color: '#eef1f7', image: o.coverPhoto.url }];
  }
  return [];
}

function toOrganizerProfile(o: ApiPublicOrganizer): OrganizerProfile {
  return {
    id: o.id,
    initials: o.initials,
    name: o.name,
    avatarColor: o.avatarColor,
    tier: coerceTier(o.tier),
    rating: o.rating,
    reviews: o.reviews,
    location: o.location,
    // No real verification/certification signal exists in the backend yet —
    // false rather than fabricated, and the badge only renders when true.
    certified: false,
    stats: [
      { value: String(o.events), label: 'Events' },
      { value: o.responseHours ? `< ${o.responseHours}h` : '—', label: 'Response' },
      { value: o.yearsOfExperience ? `${o.yearsOfExperience} yrs` : '—', label: 'Experience' },
    ],
    about: o.businessDescription || 'This organizer hasn’t added a description yet.',
    serviceArea: o.serviceAreas.length > 0 ? o.serviceAreas.join(', ') : o.location,
    portfolio: buildPortfolio(o),
    // No reviews/ratings-comments feature exists in the backend yet — an
    // honest empty list (Reviews section shows "No reviews yet") rather
    // than fabricated testimonials.
    reviewsList: [],
    estLabel: 'Estimated price range',
    estRange: o.estRange || 'Contact for a quote',
  };
}

async function fetchOrganizerProfile(id: string): Promise<OrganizerProfile> {
  const { data } = await apiClient.get<ApiPublicOrganizer>(`/organizer/getOrganizerById/${id}`);
  return toOrganizerProfile(data);
}

export const profileApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getOrganizerProfile: build.query<OrganizerProfile, string>({
      queryFn: (id) => toQueryResult(() => fetchOrganizerProfile(id)),
    }),
  }),
});
export const { useGetOrganizerProfileQuery } = profileApi;
