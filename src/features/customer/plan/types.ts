import type { ArtKey } from '@shared/reusable';

export interface PlanOccasion { id: string; label: string; art: ArtKey }
export type CategoryIcon = 'food' | 'water' | 'decor' | 'photo' | 'music' | 'priest' | 'mehendi' | 'transport';
export interface PlanCategory { id: string; title: string; subtitle: string; icon: CategoryIcon }
export type OrgTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
export interface PlanOrganizer { id: string; initials: string; name: string; avatarColor: string; tier: OrgTier; rating: number; reviews: number; events: number; location: string; tags: string[]; matches: number; total: number; estRange: string }
export interface PlanFilters { tiers: OrgTier[]; ratings: string[]; categories: string[]; sorts: string[] }
export interface PlanStep { id: string; label: string; heading: string; subtitle: string }
export type TrustIcon = 'zap' | 'shield' | 'calendar';
export interface PlanTrust { icon: TrustIcon; label: string }
export type NextIcon = 'file' | 'chart' | 'heart';
export interface WhatNextItem { icon: NextIcon; title: string; desc: string }
export interface IdeasConfig { title: string; subtitle: string; suggestions: string[]; placeholder: string }
export interface QuoteNote { title: string; text: string }

export interface PlanData {
  occasions: PlanOccasion[];
  steps: PlanStep[];
  cityOptions: string[];
  guestOptions: string[];
  subtitle: string;
  trust: PlanTrust[];
  whatNext: WhatNextItem[];
  ideas: IdeasConfig;
  budgetBanner: string;
  quoteNote: QuoteNote;
  continueLabel: string;
  footnote: string;
  categories: PlanCategory[];
  organizers: PlanOrganizer[];
  filters: PlanFilters;
}

export interface PlanDraft {
  occasionId: string;
  eventDate: string;
  city: string;
  area: string;
  guests: string;
  ideas: string;
  categories: string[];
  step: number;
}
