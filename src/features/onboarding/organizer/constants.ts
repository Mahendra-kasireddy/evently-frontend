export const ONB_COPY = {
  title: 'Become an Evently organizer',
  subtitle: 'A few quick steps to get verified and start receiving matched leads.',
  verifyNote: 'Verification typically takes 24–48 hrs after submission.',
};

/**
 * Reasons to finish, shown beside the form on the sign-up gate. Each is true
 * of the product today — the gate itself lives in
 * `features/onboarding/shared/OnboardingGate` and is shared with sub-vendor
 * signup, so only the copy differs between the two.
 */
export const GATE_POINTS = [
  'Free to join — Evently only earns when you do',
  'Verified organizers get matched to real, budgeted enquiries',
  'Your progress saves as you go, so you can finish later',
] as const;

export const ONBOARDING_STEPS = [
  { id: 'basic', order: 1, title: 'Basic info' },
  { id: 'verification', order: 2, title: 'Verification' },
  { id: 'bank', order: 3, title: 'Bank account' },
  { id: 'services', order: 4, title: 'Services' },
  { id: 'portfolio', order: 5, title: 'Profile & portfolio' },
] as const;

/**
 * Panel headings. The rail label stays short ("Bank account"); the panel above
 * the fields carries the design's fuller heading and its one-line explainer.
 */
export const STEP_HEADINGS: Record<string, { heading: string; blurb: string }> = {
  basic: { heading: 'Basic information', blurb: 'Tell us about you and your business.' },
  verification: {
    heading: 'Business verification',
    blurb: 'We verify every organizer to keep families safe.',
  },
  bank: { heading: 'Bank account', blurb: 'Where should we send your payouts?' },
  services: { heading: 'Service setup', blurb: 'What do you offer, and where?' },
  portfolio: { heading: 'Profile & portfolio', blurb: 'Make a great first impression.' },
};

// NOTE: cities, categories and business types are no longer hardcoded here —
// they come from MongoDB via GET /organizer/onboarding-config.

export const STEP_STATUS_LABEL: Record<string, string> = {
  completed: 'Completed',
  current: 'In progress',
  pending: 'Pending',
};
