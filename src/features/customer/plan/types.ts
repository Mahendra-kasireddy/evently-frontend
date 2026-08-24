import type { ArtKey } from '@shared/reusable';

export interface PlanOccasion { id: string; label: string; art: ArtKey }
export type CategoryIcon = 'food' | 'water' | 'decor' | 'photo' | 'music' | 'priest' | 'mehendi' | 'transport';
export interface PlanCategory { id: string; title: string; subtitle: string; icon: CategoryIcon }
export type OrgTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
export interface PlanOrganizer {
  id: string;
  initials: string;
  name: string;
  avatarColor: string;
  tier: OrgTier;
  rating: number;
  reviews: number;
  events: number;
  location: string;
  tags: string[];
  matches: number;
  total: number;
  estRange: string;
  // Engine-enriched fields (present for wizard recommendations, absent in browse).
  reasons?: string[];
  estMin?: number;
  estMax?: number;
  available?: boolean;
  responseHours?: number;
  score?: number;
  /** True for Evently's own concierge fallback. */
  concierge?: boolean;
}

/** Sort keys understood by the recommendation engine. */
export type RecommendationSort = 'best' | 'rating' | 'price' | 'events' | 'response' | 'nearest';
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
  budgetOptions: string[];
  subtitle: string;
  trust: PlanTrust[];
  whatNext: WhatNextItem[];
  ideas: IdeasConfig;
  budgetBanner: string;
  quoteNote: QuoteNote;
  continueLabel: string;
  footnote: string;
  categories: PlanCategory[];
  filters: PlanFilters;
}

export interface PlanDraft {
  occasionId: string;
  eventDate: string;
  city: string;
  area: string;
  guests: string;
  budget: string;
  ideas: string;
  categories: string[];
  /** Organizer chosen on the recommendations step, confirmed on Review. */
  selectedOrganizerId: string;
  step: number;
}

/** Context + filters sent to the backend recommendation engine. */
export interface RecommendationArgs {
  categories: string[];
  occasion?: string | undefined;
  guests?: string | undefined;
  city?: string | undefined;
  area?: string | undefined;
  budget?: string | undefined;
  eventDate?: string | undefined;
  venue?: 'indoor' | 'outdoor' | undefined;
  // Filters + sort (server-side)
  sort?: RecommendationSort | undefined;
  minRating?: number | undefined;
  tiers?: string[] | undefined;
  requireCategories?: string[] | undefined;
  maxPrice?: number | undefined;
  availableOnly?: boolean | undefined;
}

export type PlanStatus = 'draft' | 'submitted' | 'quoted' | 'booked' | 'cancelled';

/** A persisted event plan returned by the backend. */
export interface PlanSubmission {
  id: string;
  planCode?: string;
  occasion: string;
  eventDate?: string;
  city: string;
  area: string;
  guests: string;
  budget: string;
  ideas: string;
  categories: string[];
  status: PlanStatus;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * The five states the backend actually stores (QuoteRequestStatus in
 * quote-request.schema.ts). `accepted` and `cancelled` were missing here, so a
 * request in either state rendered a blank status badge in My Events.
 */
export type QuoteRequestStatus = 'open' | 'quoted' | 'accepted' | 'cancelled' | 'closed';

/** Minimal organizer identity attached to a request or one of its responses. */
export interface QuoteOrganizerRef {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  tier: string;
  rating: number;
}

/**
 * One organizer's response to a request, as listed on My Events. Thin by
 * design — the full line-by-line breakdown is only loaded by the comparison
 * screen, for the single request the customer opens.
 */
export interface QuoteResponse {
  quotationId: string;
  status: 'sent' | 'updated' | 'accepted' | 'rejected';
  grandTotal: number;
  advanceAmount: number;
  siteVisitSuggested: boolean;
  sentAt?: string;
  organizer: QuoteOrganizerRef | null;
}

/**
 * A quote request the customer has raised — one event's brief, plus every live
 * organizer response to it. My Events groups by this: the customer picks the
 * event first, then compares the organizers who replied to it.
 */
export interface PlanQuoteRequest {
  id: string;
  occasion: string;
  when: string;
  where: string;
  guests: string;
  status: QuoteRequestStatus;
  createdAt?: string;
  /** Set when the request targeted one organizer; null when it was broadcast. */
  organizer?: QuoteOrganizerRef | null;
  /** Live responses (drafts and withdrawn excluded), newest first. */
  responses?: QuoteResponse[];
  /** = responses.length; kept for callers that only need the count. */
  quotationCount?: number;
  lastQuotedAt?: string | null;
}

/** Payload for saving a draft / submitting a plan. */
export interface PlanUpsert {
  occasion?: string | undefined;
  eventDate?: string | undefined;
  city?: string | undefined;
  area?: string | undefined;
  guests?: string | undefined;
  budget?: string | undefined;
  ideas?: string | undefined;
  categories?: string[] | undefined;
}
