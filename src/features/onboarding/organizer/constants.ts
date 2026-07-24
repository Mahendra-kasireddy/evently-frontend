export const ONB_COPY = {
  title: 'Become an Evently organizer',
  subtitle: 'A few quick steps to get verified and start receiving matched leads.',
  verifyNote: 'Verification typically takes 24–48 hrs after submission.',
};

export const ONBOARDING_STEPS = [
  { id: 'basic', order: 1, title: 'Basic info' },
  { id: 'verification', order: 2, title: 'Verification' },
  { id: 'bank', order: 3, title: 'Bank account' },
  { id: 'services', order: 4, title: 'Services' },
  { id: 'profile', order: 5, title: 'Profile & portfolio' },
] as const;

// NOTE: cities, categories and business types are no longer hardcoded here —
// they come from MongoDB via GET /organizer/onboarding-config.

export const STEP_STATUS_LABEL: Record<string, string> = {
  completed: 'Completed',
  current: 'In progress',
  pending: 'Pending',
};
