import type { BlockOwner } from '@features/invitation';

/**
 * Copy for the customer's side of the invitation.
 *
 * The organizer's builder speaks about "the customer"; here the same document
 * is addressed to that customer, so the labels differ even though the data and
 * the guest render are shared.
 */
export const OWNER_BADGE: Record<BlockOwner, string> = {
  organizer: 'By your organizer',
  customer: 'Yours to personalize',
};

export const INVITATION_COPY = {
  eyebrowLead: 'GUEST INVITATION',
  heading: 'Your guest invitation',
  sub: 'Review each section, personalize what’s yours, and approve to publish the guest link.',
  back: 'Back',
  reviewLead: 'Review the sections below',
  requestChanges: 'Request changes',
  requestChange: 'Request change',
  approve: 'Approve & publish',
  approving: 'Publishing…',
  approved: 'Approved · live',
  preview: 'Preview',
  personalize: 'Personalize',
  ready: 'Ready',
  hidden: 'Hidden from guests',

  bannerLead: 'Your organizer built this invitation for you. ',
  bannerRest1: 'Sections marked ',
  bannerOrganizer: 'By your organizer',
  bannerRest2: ' are handled for you — request a change if needed. Sections marked ',
  bannerCustomer: 'Yours to personalize',
  bannerRest3: ' you can edit yourself. Approve to publish the guest link.',

  previewCaption: 'Live guest preview',
  previewHint: 'Scrolls like a phone',
  previewTitle: 'Guest preview',
  previewSub: 'What your guests see when they open the link',
  previewClose: 'Close preview',

  // Personalize dialog
  personalizeTitle: 'Personalize this section',
  fieldHeading: 'Headline guests see',
  fieldHeadingHint: 'Leave blank to use the section name.',
  fieldBody: 'What you want to say',
  fieldHide: 'Hide this section from guests',
  save: 'Save changes',
  saving: 'Saving…',
  cancel: 'Cancel',
  close: 'Close',

  // Request-change dialog
  requestTitle: 'Ask your organizer for a change',
  requestSubAll: 'They’ll get your note and can update the invitation.',
  requestField: 'What would you like changed?',
  requestPlaceholder: 'e.g. the live stream should start at 6pm, not 7pm',
  requestSend: 'Send to organizer',
  requestSending: 'Sending…',
  requestSent: 'Sent to your organizer',
  requestPending: (n: number) =>
    `${n} change ${n === 1 ? 'request' : 'requests'} with your organizer`,

  // States
  loading: 'Opening your invitation…',
  errorTitle: 'We couldn’t load your invitation',
  errorBody:
    'Something went wrong reaching your invitation. Check your connection and try again.',
  retry: 'Try again',
  preparingTitle: 'Your guest invitation is being prepared',
  preparingBody:
    'You’ll be able to review it here once your organizer sends it. Nothing is shared with your guests until you approve it.',
  preparingAction: 'Back to your event',
  approvedNote: 'You approved this invitation — the guest link is live.',
  awaitingNote: 'Nothing is live yet. Approve to publish the guest link.',
  // --- guest sharing ---
  share: 'Share',
  shareAll: 'Share invitation',
  shareEyebrow: 'SEND TO GUESTS',
  shareSectionTitle: (section: string) => `Share ${section}`,
  shareAllTitle: 'Share the complete invitation',
  shareIntro: 'Pick who to send it to, or add someone new. Guests need no account.',
  shareLoading: 'Loading your guest list…',
  shareNoGuests: 'No guests yet — add the first one below.',
  shareAddGuest: 'Add a guest',
  shareDiscardGuest: 'Don’t add anyone new',
  shareGuestName: 'Guest name',
  shareGuestPhone: 'WhatsApp number',
  sharePhoneHint: 'Indian mobiles need no country code; for anywhere else start with +.',
  shareNeedName: 'Enter the guest’s name.',
  shareNeedGuest: 'Choose at least one guest, or add a new one.',
  shareAlreadyExists: (name: string) => `${name} already has that number — tick them above instead.`,
  shareAlreadySelected: (name: string) => `That is ${name}’s number, and they are already selected.`,
  shareAlreadySent: 'Already sent',
  shareNewGuest: 'New',
  shareContinue: 'Continue',
  shareConfirmIntro: 'Sending to:',
  shareConfirmSection: (section: string) => `They will get the ${section.toLowerCase()} section, and can open the rest of the invitation from there.`,
  shareConfirmAll: 'They will get the complete invitation.',
  shareWhatsappCaveat:
    'We cannot check whether a number has WhatsApp — if it does not, the message will not arrive.',
  shareSend: 'Send on WhatsApp',
  shareSending: 'Sending…',
  shareSent: 'Sent',
  shareOpenWhatsapp: 'Open WhatsApp to send',
  shareHandoffNote:
    'WhatsApp opens with the message ready — press send there to deliver it. Nothing has been sent yet.',
  shareFailed: 'That could not be sent.',
  shareDone: 'Done',
  shareNotApproved: 'Approve the invitation first — then you can send it to guests.',

} as const;
