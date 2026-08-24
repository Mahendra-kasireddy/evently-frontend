import type { JoinRole } from './types';

export const JOIN_COPY = {
  titleLead: 'Join as',
  titleAccent: 'your role.',
  subtitle:
    'Manage events, coordinate services, or deliver on the ground — Evently connects all three.',
  orLabel: 'OR continue with',
  google: 'Continue with Google',
  phone: 'Continue with Phone OTP',
  moreCities: '+ more cities',
} as const;

/** How many city chips show before the "+ more cities" chip. Matches the design. */
export const CITY_CHIP_LIMIT = 4;

/**
 * The two role cards are product copy, not data: headline, description and the
 * illustrative portal stats are fixed marketing content that no API owns (the
 * same convention `landing/service.ts` already uses for its hero figures). Kept
 * here so the screen renders them synchronously instead of faking a network
 * round-trip for a constant.
 */
export const JOIN_ROLES: JoinRole[] = [
  {
    id: 'organizer',
    to: '/onboarding/organizer',
    tone: 'organizer',
    icon: 'briefcase',
    title: "I'm an Organizer",
    description:
      'Manage bookings, coordinate sub-vendors, build your event business — all from one dashboard.',
    cta: 'Get started',
    badge: 'Gold',
    stats: [
      { label: 'Events', value: '214' },
      { label: 'Rating', value: '4.8★' },
      { label: 'Tier', value: 'Gold' },
    ],
  },
  {
    id: 'subvendor',
    to: '/onboarding/subvendor',
    tone: 'subvendor',
    icon: 'truck',
    title: "I'm a Sub-vendor",
    description:
      'Accept tasks from organizers, deliver your services, and get paid automatically — no chasing needed.',
    cta: 'Get started',
    badge: 'Score 92',
    stats: [
      { label: 'Tasks', value: '48' },
      { label: 'Earned', value: '₹2.1L', tone: 'teal' },
      { label: 'Score', value: '92/100' },
    ],
  },
];
