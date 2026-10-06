export const ONB_COPY = {
  title: 'Become an Evently organizer',
  subtitle: 'A few quick steps to get verified and start receiving matched leads.',
  verifyNote: 'Verification typically takes 24–48 hrs after submission.',
  submit: 'Submit for verification',
  submitting: 'Submitting…',
  bankLater: 'Optional for now — needed before your first payout.',
};

/** The one-screen sign-up (sections/SignupForm). Mirrors the mobile app's. */
export const SIGNUP_COPY = {
  eyebrow: 'ORGANIZER SIGN-UP',
  title: 'Tell us about your business',
  subtitle: 'Just the basics to open your dashboard. Documents and bank details can wait.',
  businessPlaceholder: 'e.g. Sri Lakshmi Events',
  laterNote:
    'Next, from your dashboard: add your services and portfolio, verify your documents, and go live. Bank details are only needed before your first payout.',
  cta: 'Open my dashboard',
  submitting: 'Setting up your dashboard…',
  requiredField: 'Required',
  businessNameShort: 'Enter at least 2 characters',
};

/** What happens after sign-up, as the gate previews it. True of the product today. */
export const SIGNUP_STEPS = [
  'Verify your mobile',
  'Tell us about your business — one minute',
  'Open your dashboard and add services, portfolio and documents',
  'Go live for customers once we verify you',
] as const;

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

/**
 * In the order a business actually works through them: who you are, what you
 * offer, what it looks like, then the paperwork. Verification is the last
 * step needed to go live; bank details come after, and only for payouts.
 * Mirrors STEPS in the backend's organizer-onboarding.service.ts.
 */
export const ONBOARDING_STEPS = [
  { id: 'basic', order: 1, title: 'Basic info' },
  { id: 'services', order: 2, title: 'Services' },
  { id: 'portfolio', order: 3, title: 'Profile & portfolio' },
  { id: 'verification', order: 4, title: 'Verification' },
  { id: 'bank', order: 5, title: 'Bank account' },
] as const;

/** Steps that must be complete before the profile can be submitted. */
export const GO_LIVE_STEP_IDS: readonly string[] = ['basic', 'services', 'portfolio', 'verification'];

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
  bank: {
    heading: 'Bank account',
    blurb: 'Where should we send your payouts? Optional for now — needed before your first payout.',
  },
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
