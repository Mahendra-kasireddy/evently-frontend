/**
 * Landing content layer.
 *
 * Everything served from here is STATIC PRODUCT COPY: the occasion taxonomy,
 * the how-it-works steps, the value propositions and the FAQ answers. None of it
 * is a claim about real users, real bookings or real aggregate performance.
 *
 * Testimonials, platform statistics, popular-organizer cards and the featured
 * "your vendors" list used to be served from here too, as invented records —
 * five named authors carrying `verified: true` and five-star ratings, four
 * named businesses with ratings and event counts, and "2,400+ celebrations
 * planned / 4.8★ average rating". They were removed rather than replaced: there
 * is no endpoint behind them, and fabricated reviews and aggregate ratings
 * presented as genuine are a legal exposure, not just a defect. Re-add each
 * section only once a real endpoint backs it (`/landing/statistics`,
 * `/testimonials`, `/organizers/popular`).
 *
 * Each remaining function keeps the matching apiClient call commented above it,
 * for when this copy becomes CMS-driven.
 */
import { apiClient } from '@lib/api';
import { baseApi, toQueryResult } from '@lib/rtk';
import type { Category, FaqItem, Feature, HowItWorksStep } from './types';

/* ---------------------------------------------------------------------------
 * Mock JSON data
 * ------------------------------------------------------------------------- */

const staticCategories: Category[] = [
  { id: 'cat-1', slug: 'weddings', title: 'Weddings', subtitle: 'Grand & intimate', icon: 'heart', imageUrl: '/images/cat-weddings.png' },
  { id: 'cat-2', slug: 'birthdays', title: 'Birthdays', subtitle: 'Kids to milestone', icon: 'gift', imageUrl: '/images/cat-birthdays.png' },
  { id: 'cat-3', slug: 'housewarming', title: 'Housewarming', subtitle: 'Gruhapravesam', icon: 'home', imageUrl: '/images/cat-housewarming.png' },
  { id: 'cat-4', slug: 'naming', title: 'Naming ceremony', subtitle: 'Barasala & more', icon: 'sparkles', imageUrl: '/images/cat-naming.png' },
  { id: 'cat-5', slug: 'anniversaries', title: 'Anniversaries', subtitle: 'Golden moments', icon: 'rings', imageUrl: '/images/cat-anniversaries.png' },
  { id: 'cat-6', slug: 'corporate', title: 'Corporate', subtitle: 'Launches & meets', icon: 'briefcase', imageUrl: '/images/cat-corporate.png' },
];

const staticSteps: HowItWorksStep[] = [
  { id: 'step-1', order: 1, title: 'Tell us about your event', description: 'Pick your celebration, date, guest count and the categories you need — get an instant estimate in seconds.', tag: 'Instant estimate' },
  { id: 'step-2', order: 2, title: 'Compare verified quotes', description: 'Receive itemized quotes from trained, verified organizers and compare them line by line, side by side.', tag: 'Transparent pricing' },
  { id: 'step-3', order: 3, title: 'Book & track live', description: 'Pay a small advance, then track every vendor in real time — right up to the big day.', tag: 'Live tracking' },
];

const staticFeatures: Feature[] = [
  { id: 'feat-1', title: 'Sub-vendor orchestration', description: 'One organizer coordinates every vendor for you.', icon: 'users' },
  { id: 'feat-2', title: 'Transparent quotes', description: 'Itemized pricing, no hidden costs, ever.', icon: 'file-text' },
  { id: 'feat-3', title: 'Verified & trained', description: 'KYC-verified, Evently Academy-certified.', icon: 'shield-check' },
  { id: 'feat-4', title: 'Family co-planning', description: 'Invite family to view and plan together.', icon: 'eye' },
];

const staticFaqs: FaqItem[] = [
  { id: 'faq-1', question: 'How much does Evently cost?', answer: 'Planning is completely free. You only pay your chosen organizer’s quoted amount — a small advance to confirm the booking, and the balance on completion.' },
  { id: 'faq-2', question: 'Are the organizers verified?', answer: 'Every organizer is KYC-verified and certified through Evently Academy before they can receive leads.' },
  { id: 'faq-3', question: 'Can I compare multiple quotes?', answer: 'Yes. You receive itemized quotes from multiple organizers and can compare them line by line, side by side.' },
  { id: 'faq-4', question: 'What if something goes wrong on the day?', answer: 'You track every vendor live in the app, and Evently support is available right up to and through your event.' },
];

/** Simulates network latency so the loading states stay exercised. */
function simulateLatency(ms = 400): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* ---------------------------------------------------------------------------
 * Data-access functions (swap the static body for an apiClient call when this
 * copy becomes CMS-driven)
 * ------------------------------------------------------------------------- */

// return apiClient.get<Category[]>('/categories').then((r) => r.data);
export async function getCategories(): Promise<Category[]> {
  await simulateLatency();
  return staticCategories;
}

// return apiClient.get<HowItWorksStep[]>('/landing/steps').then((r) => r.data);
export async function getSteps(): Promise<HowItWorksStep[]> {
  await simulateLatency(250);
  return staticSteps;
}

// return apiClient.get<Feature[]>('/landing/features').then((r) => r.data);
export async function getFeatures(): Promise<Feature[]> {
  await simulateLatency(250);
  return staticFeatures;
}

// return apiClient.get<FaqItem[]>('/faqs').then((r) => r.data);
export async function getFaqs(): Promise<FaqItem[]> {
  await simulateLatency(250);
  return staticFaqs;
}

/* ---------------------------------------------------------------------------
 * RTK Query endpoints (one per data-access fn). Hooks are aliased back to the
 * original names in ./hooks/useLandingData.
 * ------------------------------------------------------------------------- */

// Thin adapter over the shared helper so the endpoints below stay unchanged.
const wrapQuery =
  <T>(fn: () => Promise<T>) =>
  () =>
    toQueryResult(fn);

/**
 * Platform statistics for the hero.
 *
 * This is the endpoint the note at the top of this file was waiting for. Every
 * figure is counted server-side from real bookings and organizers, and any that
 * has nothing behind it arrives as null so the hero can leave that card out
 * rather than print a zero that reads as a claim.
 */
export interface PlatformStatistics {
  celebrationsPlanned: number | null;
  averageRating: number | null;
  ratingCount: number | null;
  verifiedShare: number | null;
  familiesServed: number | null;
}

export const landingApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCategories: build.query<Category[], void>({ queryFn: wrapQuery(getCategories) }),
    getSteps: build.query<HowItWorksStep[], void>({ queryFn: wrapQuery(getSteps) }),
    getFeatures: build.query<Feature[], void>({ queryFn: wrapQuery(getFeatures) }),
    getFaqs: build.query<FaqItem[], void>({ queryFn: wrapQuery(getFaqs) }),

    /** The one landing endpoint that is real data rather than static copy. */
    getPlatformStatistics: build.query<PlatformStatistics, void>({
      queryFn: () =>
        toQueryResult(
          async () =>
            (await apiClient.get<PlatformStatistics>('/content/getPlatformStatistics')).data,
        ),
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetStepsQuery,
  useGetFeaturesQuery,
  useGetFaqsQuery,
  useGetPlatformStatisticsQuery,
} = landingApi;
