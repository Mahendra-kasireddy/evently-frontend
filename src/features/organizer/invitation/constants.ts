import type { BlockOwner, InvitationStatus } from './types';

/*
 * The section-catalogue glue (icon map, generated-block keys, date formatting)
 * is shared with the customer's review screen — re-exported here so the
 * builder's own imports stay in one place.
 */
export {
  BLOCK_ICON,
  COUNTDOWN_BLOCK,
  FALLBACK_BLOCK_ICON,
  HEADER_BLOCK,
  daysUntil,
  longDateLabel,
  timeLabel,
} from '@features/invitation';

export const OWNER_LABEL: Record<BlockOwner, string> = {
  organizer: 'You manage',
  customer: 'Customer personalizes',
};

export const STATUS_COPY: Record<InvitationStatus, string> = {
  draft: 'Draft · not sent to the customer yet',
  sent: 'Sent to customer · awaiting approval',
  approved: 'Approved by customer · the guest link is live.',
};

/** Static UI copy — the page title itself comes from the organizer shell. */
export const INVITATION_COPY = {
  heading: 'Guest invitation builder',
  addSection: 'Add section',
  send: 'Send to customer',
  resend: 'Send again',
  tipLead: 'You assemble the invitation for your client. ',
  tipRest1:
    'Configure the logistics blocks (countdown, live stream, gate pass, transport). Sections marked ',
  tipHighlight: 'Customer personalizes',
  tipRest2: ' are filled in by them — names, story, photos.',
  visible: 'Visible',
  hidden: 'Hidden from guests',
  show: 'Show to guests',
  hide: 'Hide from guests',
  edit: 'Edit',
  previewCaption: 'Guest preview',
  awaitingHint: 'Only the customer can approve — you’ll be notified when they do.',
  editorTitle: 'Edit section',
  newTitle: 'Add a section',
  fieldTitle: 'Section name',
  fieldHeading: 'Headline shown to guests',
  fieldBody: 'Body copy',
  fieldsTitle: 'Event details',
  cancel: 'Cancel',
  save: 'Save changes',
  add: 'Add section',
  remove: 'Remove section',
  customerNote:
    'The customer fills this section in from their own screen — your copy here is the placeholder they start from.',
  detailsTitle: 'Invitation details',
  template: 'Template',
  eyebrow: 'Eyebrow line',
  hostOne: 'First name',
  hostTwo: 'Second name',
  joiner: 'Joining word',
  eventDate: 'Event date',
  eventTime: 'Start time',
  venueName: 'Venue',
  venueAddress: 'Address',
  message: 'Invitation message',
  rsvp: 'Collect RSVPs',
  rsvpDeadline: 'RSVP by',
  rsvpPlusOnes: 'Allow plus-ones',
  youreInvited: 'YOU’RE INVITED',
  scroll: 'SCROLL',
  previewEmpty: 'Every section is hidden — turn one back on to show guests something.',
  loading: 'Loading the invitation…',
  errorTitle: 'We couldn’t load this invitation',
  errorBody: 'Check your connection and try again.',
  saving: 'Saving…',
  savedJustNow: 'All changes saved',
  asksTitle: 'Change requests from your customer',
  asksWhole: 'The invitation overall',
  asksResolve: 'Mark done',
} as const;

