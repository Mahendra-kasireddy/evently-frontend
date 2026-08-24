export const TIER_LABEL: Record<string, string> = {
  Bronze: 'Bronze organizer',
  Silver: 'Silver organizer',
  Gold: 'Gold organizer',
  Platinum: 'Platinum organizer',
};

/** Medal-tile colour per tier, from the shared tier tokens. */
export const TIER_COLOR: Record<string, string> = {
  Bronze: 'var(--tier-bronze-bg)',
  Silver: 'var(--tier-silver-bg)',
  Gold: 'var(--tier-gold-bg)',
  Platinum: 'var(--tier-platinum-bg)',
};

export type PerkIcon = 'ranking' | 'verified' | 'commission' | 'priority' | 'support';

/**
 * Product copy for what a tier unlocks — a business promise, not user data, so
 * it lives here rather than coming from the API. The commission perk carries a
 * `{rate}` placeholder filled from the live tier ladder, so the number can
 * never drift from what the backend actually charges.
 */
export const TIER_PERKS: Record<string, Array<{ icon: PerkIcon; label: string }>> = {
  Gold: [
    { icon: 'ranking', label: 'Higher search ranking' },
    { icon: 'verified', label: 'Verified+ badge' },
    { icon: 'commission', label: 'Lower {rate} commission' },
    { icon: 'priority', label: 'Priority enquiries' },
  ],
  Platinum: [
    { icon: 'ranking', label: 'Top search placement' },
    { icon: 'verified', label: 'Platinum badge' },
    { icon: 'commission', label: 'Lowest {rate} commission' },
    { icon: 'support', label: 'Dedicated support' },
  ],
};

export const BADGES_COPY = {
  currentTier: 'Current tier',
  requirementsSuffix: 'tier requirements',
  events: 'Events completed',
  ratingPrefix: 'Avg rating',
  trainingPrefix: 'Training Stage',
  complaints: 'No major complaints',
  stagePrefix: 'Stage',
  helpTitlePrefix: 'Need help reaching',
  helpSub: 'Your Evently Mitra can build a plan with you.',
  helpCta: 'Talk to Mitra',
  commissionTitle: 'Commission rate',
  yourRate: 'Your rate',
  unlocksPrefix: 'What unlocks at',
  unlocksFootPrefix: 'Unlocks at',
  topTierTitle: 'You’re at the top tier',
  topTierBody: 'Platinum is the highest tier — you already have every perk and the lowest commission.',
  pending: 'pending',
} as const;

/** `0.08` → `8%`. */
export const ratePercent = (rate: number): string => `${Math.round(rate * 100)}%`;

/** `1` → `Training Stage 1`, `2` → `Training Stage 1 & 2`, `3` → `Training Stage 1–3`. */
export function trainingLabel(required: number): string {
  const p = BADGES_COPY.trainingPrefix;
  if (required <= 1) return `${p} 1`;
  if (required === 2) return `${p} 1 & 2`;
  return `${p} 1–${required}`;
}
