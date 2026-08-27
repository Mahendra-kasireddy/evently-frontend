export interface NavItem { label: string; to: string; active?: boolean }

export interface HeroDraft { occasion: string; when: string; where: string; guests: string }
export interface HeroOptions { occasion: string[]; when: string[]; where: string[]; guests: string[] }
export type TrustIcon = 'zap' | 'shield' | 'star';
export interface TrustItem { icon: TrustIcon; label: string }
export interface HeroData {
  greeting: string;
  headingLead: string;
  headingAccent: string;
  headingTail: string;
  subtitle: string;
  draftLabel: string;
  draft: HeroDraft;
  options: HeroOptions;
  trust: TrustItem[];
}

export interface BookedStep { label: string; done: boolean }

/**
 * Which live state the booking is in — drives the card's badge wording.
 *
 * `pending` is included because a booking exists (and is paid for) from the
 * moment the customer accepts a quote; only the organizer can move it to
 * confirmed. Leaving it out meant the customer saw no booked event at all until
 * the organizer got round to confirming.
 */
export type BookedEventStatus = 'pending' | 'confirmed' | 'in_progress';

/**
 * The customer's ongoing booking, behind Home's rich "BOOKED" card. The backend
 * only ever returns it for a confirmed or in-progress booking, so the card is
 * shown exactly when there is a real, live booking to open.
 */
export interface BookedEventData {
  id: string;
  ref: string;
  /** "Your Wedding · 28 Dec 2026" — composed by the API from occasion + date. */
  title: string;
  description: string;
  /** Share of the milestones below that are done, so ring and ticks agree. */
  progress: number;
  daysToGo: number;
  status: BookedEventStatus;
  /** False while the booking is paid for but not yet accepted by the organizer. */
  organizerConfirmed: boolean;
  organizerName: string;
  steps: BookedStep[];
}

/**
 * The eight stages of the customer's event journey (mirrors the backend
 * CurrentEventStage). The Home "Current Event" card renders whichever stage is
 * currently active.
 */
export type CurrentEventStage =
  | 'draft'
  | 'submitted'
  | 'quotes_received'
  | 'quote_accepted'
  | 'booking_created'
  | 'booking_confirmed'
  | 'in_progress'
  | 'completed';

export type BookingStatusValue =
  | 'pending'
  | 'awaiting_organizer'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'rejected'
  | 'expired';

export interface CurrentEventOrganizer {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  tier: string;
  rating: number;
}

/** Single "Current Event" object from the home feed (null when none active). */
export interface CurrentEventData {
  stage: CurrentEventStage;
  rank: number;
  refId: string;
  refCode: string | null;
  source: 'plan' | 'quote' | 'booking';
  title: string;
  occasion: string;
  progress: number;
  daysToGo: number | null;
  organizer: CurrentEventOrganizer | null;
  quoteCount: number;
  bookingStatus: BookingStatusValue | null;
  quotationId: string | null;
  hasNewActivity: boolean;
}

export type OccasionIcon = 'heart' | 'gift' | 'home' | 'sparkles' | 'star' | 'briefcase';
export type OccasionArt = 'wedding' | 'birthday' | 'housewarming' | 'naming' | 'anniversary' | 'corporate';
export interface OccasionCard { id: string; icon: OccasionIcon; art: OccasionArt; label: string; cta: string }
export interface PlanSection { title: string; subtitle: string; occasions: OccasionCard[] }

export type ToolIcon = 'wallet' | 'users' | 'list' | 'bell';
export interface Tool { id: string; icon: ToolIcon; title: string; description: string }
export interface ToolsSection { title: string; subtitle: string; tools: Tool[] }

export interface PackageItem { id: string; badge: string; title: string; guests: string; budget: string; tags: string[]; art: OccasionArt }
export interface PackagesSection { title: string; subtitle: string; buildLabel: string; items: PackageItem[] }

export type OrganizerTier = 'Gold' | 'Silver' | 'Platinum';
export interface Organizer {
  id: string; initials: string; name: string; avatarColor: string;
  tier: OrganizerTier; rating: number; reviews: number; events: number; tags: string[];
}
export type NearbyScope = 'city' | 'all';
export interface TopOrganizers {
  title: string;
  seeAllLabel: string;
  organizers: Organizer[];
  /** Where the list came from, and the city asked for — drives the labelling. */
  scope: NearbyScope;
  city: string;
}

export type HowIcon = 'edit' | 'file' | 'chart' | 'shield';
export interface HowStep { num: string; icon: HowIcon; title: string; description: string }
export interface HowItWorks { title: string; subtitle: string; steps: HowStep[] }

export interface CustomerHomeUser { initials: string; name: string; location: string }
export interface CustomerHomeData {
  user: CustomerHomeUser;
  nav: NavItem[];
  hero: HeroData;
  bookedEvent?: BookedEventData | undefined; // per-user; from the home feed
  currentEvent?: CurrentEventData | undefined; // per-user; latest active event stage
  planSection: PlanSection;
  howItWorks: HowItWorks;
  topOrganizers: TopOrganizers;
  packages: PackagesSection;
  tools: ToolsSection;
}

/** Profile summary for the header/greeting (GET /user/getProfileSummary). */
export interface ProfileSummary { id: string; name: string; initials: string; location: string }

/** Editable copy blob (GET /content/getCustomerHomeContent). No per-user data here. */
export interface HomeContent {
  nav: NavItem[];
  hero: {
    greetingTemplate: string;
    headingLead: string;
    headingAccent: string;
    headingTail: string;
    subtitle: string;
    draftLabel: string;
    defaultDraft: HeroDraft;
    options: HeroOptions;
    trust: TrustItem[];
  };
  planSection: PlanSection;
  howItWorks: HowItWorks;
  topOrganizers: { title: string; seeAllLabel: string };
  packages: { title: string; subtitle: string; buildLabel: string };
  tools: ToolsSection;
}
