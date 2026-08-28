export const SETTINGS_COPY = {
  title: 'Settings',
  subtitle: 'Your account, your availability, and how Evently reaches you.',

  accountTitle: 'Account',
  accountNote: 'Shared with the organizers you work with.',

  availabilityTitle: 'Taking work',

  notificationsTitle: 'Notifications',
  /*
   * Stated plainly rather than rendered as switches. Evently stores no
   * notification preferences and has no email or SMS provider configured —
   * notifications are in-app only. Toggles here would be decoration that looks
   * like control, which is worse than saying what actually happens.
   */
  notificationsBody:
    'Evently notifies you in the app — the bell in the top bar. Email and SMS notifications aren’t set up yet, so there’s nothing to configure here.',

  dangerTitle: 'Session',
  signOut: 'Sign out',
  signOutNote: 'You’ll need your mobile number and a code to sign back in.',
} as const;
