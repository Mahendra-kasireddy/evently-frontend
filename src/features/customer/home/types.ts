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
export interface BookedEventData {
  ref: string;
  title: string;
  description: string;
  progress: number;
  daysToGo: number;
  steps: BookedStep[];
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
export interface TopOrganizers { title: string; seeAllLabel: string; organizers: Organizer[] }

export type HowIcon = 'edit' | 'file' | 'chart' | 'shield';
export interface HowStep { num: string; icon: HowIcon; title: string; description: string }
export interface HowItWorks { title: string; subtitle: string; steps: HowStep[] }

export interface CustomerHomeUser { initials: string; name: string; location: string }
export interface CustomerHomeData {
  user: CustomerHomeUser;
  nav: NavItem[];
  hero: HeroData;
  bookedEvent?: BookedEventData | undefined; // per-user; from the home feed
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
