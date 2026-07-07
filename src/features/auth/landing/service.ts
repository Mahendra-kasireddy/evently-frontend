/**
 * Landing data layer — ALL mock JSON data + ALL data-access functions in one
 * place. Components never call this directly; hooks (TanStack Query) wrap it.
 *
 * Backend is not ready, so each function returns mock data. To go live, replace
 * the body of each function with the matching apiClient call (commented above
 * it). Hooks and components do not change.
 */
import { baseApi, toQueryResult } from '@lib/rtk';
import type {
  Category,
  FaqItem,
  Feature,
  FeaturedEvent,
  HowItWorksStep,
  Organizer,
  Statistic,
  Testimonial,
} from './types';

/* ---------------------------------------------------------------------------
 * Mock JSON data
 * ------------------------------------------------------------------------- */

const mockCategories: Category[] = [
  { id: 'cat-1', slug: 'weddings', title: 'Weddings', subtitle: 'Grand & intimate', icon: 'heart', imageUrl: '/images/cat-weddings.png' },
  { id: 'cat-2', slug: 'birthdays', title: 'Birthdays', subtitle: 'Kids to milestone', icon: 'gift', imageUrl: '/images/cat-birthdays.png' },
  { id: 'cat-3', slug: 'housewarming', title: 'Housewarming', subtitle: 'Gruhapravesam', icon: 'home', imageUrl: '/images/cat-housewarming.png' },
  { id: 'cat-4', slug: 'naming', title: 'Naming ceremony', subtitle: 'Barasala & more', icon: 'sparkles', imageUrl: '/images/cat-naming.png' },
  { id: 'cat-5', slug: 'anniversaries', title: 'Anniversaries', subtitle: 'Golden moments', icon: 'rings', imageUrl: '/images/cat-anniversaries.png' },
  { id: 'cat-6', slug: 'corporate', title: 'Corporate', subtitle: 'Launches & meets', icon: 'briefcase', imageUrl: '/images/cat-corporate.png' },
];

const mockStatistics: Statistic[] = [
  { id: 'stat-1', value: '2,400+', label: 'celebrations planned', icon: 'sparkles' },
  { id: 'stat-2', value: '4.8★', label: 'average rating', icon: 'star' },
  { id: 'stat-3', value: '100%', label: 'verified & trained', icon: 'shield-check' },
];

const mockSteps: HowItWorksStep[] = [
  { id: 'step-1', order: 1, title: 'Tell us about your event', description: 'Pick your celebration, date, guest count and the categories you need — get an instant estimate in seconds.', tag: 'Instant estimate' },
  { id: 'step-2', order: 2, title: 'Compare verified quotes', description: 'Receive itemized quotes from trained, verified organizers and compare them line by line, side by side.', tag: 'Transparent pricing' },
  { id: 'step-3', order: 3, title: 'Book & track live', description: 'Pay a small advance, then track every vendor in real time — right up to the big day.', tag: 'Live tracking' },
];

const mockFeatures: Feature[] = [
  { id: 'feat-1', title: 'Sub-vendor orchestration', description: 'One organizer coordinates every vendor for you.', icon: 'users' },
  { id: 'feat-2', title: 'Transparent quotes', description: 'Itemized pricing, no hidden costs, ever.', icon: 'file-text' },
  { id: 'feat-3', title: 'Verified & trained', description: 'KYC-verified, Evently Academy-certified.', icon: 'shield-check' },
  { id: 'feat-4', title: 'Family co-planning', description: 'Invite family to view and plan together.', icon: 'eye' },
];

const mockTestimonials: Testimonial[] = [
  { id: 'tst-1', quote: 'Booked our whole wedding in one evening — everything just worked.', authorName: 'Priya Reddy', authorInitials: 'PR', city: 'Hyderabad', occasion: 'Wedding', rating: 5, likes: 1200, imageUrl: '/images/story-wedding.png', verified: true },
  { id: 'tst-2', quote: 'Comparing itemized quotes saved us ₹40,000. So transparent.', authorName: 'Arjun Mehta', authorInitials: 'AM', city: 'Bangalore', occasion: 'Birthday', rating: 5, likes: 856, imageUrl: '/images/story-birthday.png', verified: true },
  { id: 'tst-3', quote: 'The organizer handled every vendor. We just enjoyed the day.', authorName: 'Lakshmi Rao', authorInitials: 'LR', city: 'Vijayawada', occasion: 'Housewarming', rating: 5, likes: 2100, imageUrl: '/images/story-housewarming.png', verified: true },
  { id: 'tst-4', quote: 'From invites to the stage, everything was handled. Zero stress.', authorName: 'Sneha Iyer', authorInitials: 'SI', city: 'Chennai', occasion: 'Naming', rating: 5, likes: 1500, imageUrl: '/images/cat-naming.png', verified: true },
  { id: 'tst-5', quote: 'Our anniversary felt effortless — they thought of every detail.', authorName: 'Rohan Verma', authorInitials: 'RV', city: 'Pune', occasion: 'Anniversary', rating: 5, likes: 980, imageUrl: '/images/cat-anniversaries.png', verified: true },
];

const mockOrganizers: Organizer[] = [
  { id: 'org-1', name: 'Sharma Events', initials: 'SE', specialty: 'Weddings & receptions', rating: 4.9, eventsCount: 180, city: 'Hyderabad', verified: true },
  { id: 'org-2', name: 'Bloom Decor', initials: 'BD', specialty: 'Decor & florals', rating: 4.8, eventsCount: 240, city: 'Bangalore', verified: true },
  { id: 'org-3', name: 'Ramesh Caterers', initials: 'RC', specialty: 'Catering', rating: 4.7, eventsCount: 320, city: 'Chennai', verified: true },
  { id: 'org-4', name: 'Lens & Co', initials: 'LC', specialty: 'Photography & film', rating: 4.9, eventsCount: 150, city: 'Pune', verified: true },
];

const mockFeaturedEvents: FeaturedEvent[] = [
  { id: 'ev-1', title: 'Decoration', category: 'Decor', vendorName: 'Bloom Decor', status: 'On track', imageUrl: '/images/cat-weddings.png' },
  { id: 'ev-2', title: 'Catering', category: 'Food', vendorName: 'Ramesh Caterers', status: '₹1.05L', imageUrl: '/images/cat-birthdays.png' },
  { id: 'ev-3', title: 'Photography', category: 'Media', vendorName: 'Lens & Co', status: '10 hrs', imageUrl: '/images/cat-corporate.png' },
];

const mockFaqs: FaqItem[] = [
  { id: 'faq-1', question: 'How much does Evently cost?', answer: 'Planning is completely free. You only pay your chosen organizer’s quoted amount — a small advance to confirm the booking, and the balance on completion.' },
  { id: 'faq-2', question: 'Are the organizers verified?', answer: 'Every organizer is KYC-verified and certified through Evently Academy before they can receive leads.' },
  { id: 'faq-3', question: 'Can I compare multiple quotes?', answer: 'Yes. You receive itemized quotes from multiple organizers and can compare them line by line, side by side.' },
  { id: 'faq-4', question: 'What if something goes wrong on the day?', answer: 'You track every vendor live in the app, and Evently support is available right up to and through your event.' },
];

/** Simulates network latency so loading states are exercised against mocks. */
function simulateLatency(ms = 400): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* ---------------------------------------------------------------------------
 * Data-access functions (swap mock body -> apiClient call when backend is ready)
 * ------------------------------------------------------------------------- */

// return apiClient.get<Category[]>('/categories').then((r) => r.data);
export async function getCategories(): Promise<Category[]> {
  await simulateLatency();
  return mockCategories;
}

// return apiClient.get<Statistic[]>('/landing/statistics').then((r) => r.data);
export async function getStatistics(): Promise<Statistic[]> {
  await simulateLatency(250);
  return mockStatistics;
}

// return apiClient.get<HowItWorksStep[]>('/landing/steps').then((r) => r.data);
export async function getSteps(): Promise<HowItWorksStep[]> {
  await simulateLatency(250);
  return mockSteps;
}

// return apiClient.get<Feature[]>('/landing/features').then((r) => r.data);
export async function getFeatures(): Promise<Feature[]> {
  await simulateLatency(250);
  return mockFeatures;
}

// return apiClient.get<Testimonial[]>('/testimonials').then((r) => r.data);
export async function getTestimonials(): Promise<Testimonial[]> {
  await simulateLatency();
  return mockTestimonials;
}

// return apiClient.get<Organizer[]>('/organizers/popular').then((r) => r.data);
export async function getPopularOrganizers(): Promise<Organizer[]> {
  await simulateLatency();
  return mockOrganizers;
}

// return apiClient.get<FeaturedEvent[]>('/events/featured').then((r) => r.data);
export async function getFeaturedEvents(): Promise<FeaturedEvent[]> {
  await simulateLatency();
  return mockFeaturedEvents;
}

// return apiClient.get<FaqItem[]>('/faqs').then((r) => r.data);
export async function getFaqs(): Promise<FaqItem[]> {
  await simulateLatency(250);
  return mockFaqs;
}

/* ---------------------------------------------------------------------------
 * RTK Query endpoints (one per data-access fn). Hooks are aliased back to the
 * original names in ./hooks/useLandingData.
 * ------------------------------------------------------------------------- */

// Thin adapter over the shared helper so the 8 endpoints below stay unchanged.
const wrapQuery =
  <T>(fn: () => Promise<T>) =>
  () =>
    toQueryResult(fn);

export const landingApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCategories: build.query<Category[], void>({ queryFn: wrapQuery(getCategories) }),
    getStatistics: build.query<Statistic[], void>({ queryFn: wrapQuery(getStatistics) }),
    getSteps: build.query<HowItWorksStep[], void>({ queryFn: wrapQuery(getSteps) }),
    getFeatures: build.query<Feature[], void>({ queryFn: wrapQuery(getFeatures) }),
    getTestimonials: build.query<Testimonial[], void>({ queryFn: wrapQuery(getTestimonials) }),
    getPopularOrganizers: build.query<Organizer[], void>({
      queryFn: wrapQuery(getPopularOrganizers),
    }),
    getFaqs: build.query<FaqItem[], void>({ queryFn: wrapQuery(getFaqs) }),
    getFeaturedEvents: build.query<FeaturedEvent[], void>({ queryFn: wrapQuery(getFeaturedEvents) }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetStatisticsQuery,
  useGetStepsQuery,
  useGetFeaturesQuery,
  useGetTestimonialsQuery,
  useGetPopularOrganizersQuery,
  useGetFaqsQuery,
  useGetFeaturedEventsQuery,
} = landingApi;
