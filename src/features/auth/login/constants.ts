/** Static copy + config for the login feature. No magic strings in components. */
export const SEND_OTP_ENDPOINT = '/auth/sendOtp';
export const VERIFY_OTP_ENDPOINT = '/auth/verifyOtp';

export const PROMO = {
  badge: 'Verified organizers only',
  titleLead: 'Welcome back to effortless',
  titleAccent: 'celebrations.',
  description:
    "Log in to track your event, review your organizer's plan, and approve every detail — all in one place.",
  features: [
    { icon: 'sparkles', text: 'One organizer handles catering, decor, photography & more' },
    { icon: 'file-text', text: 'Compare transparent quotes side by side' },
    { icon: 'heart', text: 'Build & share one beautiful guest invitation' },
  ],
  proofValue: '2,400+',
  proofLabel: 'families celebrated with Evently',
} as const;

export const FORM = {
  title: 'Log in or sign up',
  subtitle:
    "Enter your mobile number — we'll text you a one-time code. No passwords, ever.",
  mobileLabel: 'Mobile number',
  dialCode: '+91',
  placeholder: '98765 43210',
  sendCta: 'Send OTP',
  emailCta: 'Continue with email',
} as const;
