/** Static copy for the organizer dashboard — verbatim from the reference design (P-04). */
export const HOME_COPY = {
  statsEnquiries: 'New enquiries',
  statsActive: 'Active bookings',
  statsMonth: 'This month',
  statsRating: 'Avg rating',
  tasksTitle: 'Today’s tasks',
  tasksEmpty: 'Nothing due today.',
  badgeTitle: 'Badge progress',
  scheduleTitle: 'Next 7 days',
  scheduleEmpty: 'Nothing on the calendar this week.',
  enquiriesTitle: 'Pending enquiries',
  enquiriesEmpty: 'No open enquiries right now.',
  enquiriesViewAll: 'View all',
  enquiriesCta: 'View & Quote',
};

/** The go-live checklist card (sections/GoLiveCard) shown until verification. */
export const GO_LIVE_COPY = {
  setupTitle: 'Finish setting up to go live',
  setupBody:
    'Your dashboard is ready. Complete these steps and submit for verification — once verified, customers can find you and send enquiries.',
  changesTitle: 'A few changes needed',
  changesBody: 'Our team asked for some changes. Update your profile and submit it again.',
  submittedTitle: 'Verification in progress',
  submittedBody:
    'Your profile is with our team — verification usually takes 24–48 hours. We’ll notify you the moment you’re live.',
  rejectedTitle: 'Registration not approved',
  rejectedBody: 'Your organizer registration was not approved. Contact Evently support if you think this is a mistake.',
  progress: (done: number, total: number) => `${done} of ${total} done`,
  missing: (fields: string[]) =>
    fields.length > 2 ? `${fields.slice(0, 2).join(', ')} and ${fields.length - 2} more` : fields.join(', '),
  fill: 'Complete',
  bankNote: 'Optional for now — needed before your first payout',
  start: 'Start setup',
  continue: 'Continue setup',
  submit: 'Submit for verification',
  submitting: 'Submitting…',
  verifyNote: 'Verification takes 24–48 hrs.',
  payoutBody: 'Add your bank details so your first payout isn’t held up.',
  payoutCta: 'Add bank details',
};
