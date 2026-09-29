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
  heading: 'Guest invitation',
  /* ---- the artwork the organizer uploads ---- */
  artworkTitle: 'The invitation',
  artworkLead:
    'Design the invitation wherever you normally design \u2014 then upload the finished thing here. It is what your customer approves and what their guests open.',
  artworkImage: 'Upload an image',
  artworkVideo: 'Upload a video',
  artworkReplace: 'Replace',
  artworkRemove: 'Remove',
  artworkUploading: 'Uploading\u2026',
  artworkEmptyTitle: 'Nothing uploaded yet',
  artworkEmptyBody:
    'JPG, PNG or WEBP for an image; MP4, WEBM or MOV for a video.',
  artworkVideoLength: (seconds: number) => `Video \u00b7 ${seconds} seconds`,
  artworkImageLabel: 'Image invitation',
  /* ---- the story ---- */
  storyTitle: 'Their story',
  storyLead:
    'A few photographs, in the order you want guests to swipe through them. Each one can carry a short line.',
  storyTitleField: 'Section title',
  storyTitlePlaceholder: 'Our Journey',
  storyCaption: 'Caption',
  storyCaptionHint: 'Where our story began\u2026',
  storyAdd: 'Add a photo',
  storySave: 'Save story',
  storySaving: 'Saving\u2026',
  storyUploading: 'Uploading\u2026',
  storyFull: 'That is the maximum.',
  storyEmpty: 'With no photos, guests do not see a story section at all.',
  /* ---- the countdown, and the notice it raises ---- */
  /* ---- Save the Date targeting ---- */
  subVisibleGroups: 'Only some guest groups',
  subGroups: 'Who sees this card',
  subGroupsNone: 'No group ticked, so no guest sees this card yet.',
  /* ---- F6: shared memories, the organizer's narrow view ---- */
  memTitle: 'Shared memories',
  memLead:
    'What everyone photographed. You can add your own \u2014 the gallery, who may see it and what stays in it are your customer\u2019s to decide.',
  memTally: (n: number) => `${n} shared`,
  memTabsLabel: 'What to show',
  memEventsLabel: 'Which celebration',
  memAll: 'All',
  memPhotos: 'Photos',
  memVideos: 'Videos',
  memReels: 'Reels',
  memAllEvents: 'All events',
  memEmpty: 'Nothing has been shared yet.',
  memAdd: 'Add a photo or video',
  memAdding: 'Adding\u2026',
  memOwnerNote: 'Your customer controls this gallery.',
  memWaiting: 'Waiting for approval',
  memClose: 'Close',
  memOpen: (n: number, total: number) => `Open item ${n} of ${total}`,
  countdownTitle: 'Countdown',
  countdownLead:
    'Guests see a live countdown to whichever event you choose, in that event\u2019s own timezone.',
  countdownTarget: 'Count down to',
  countdownWholeEvent: 'The event date on the invitation',
  countdownUnnamed: 'Untitled event',
  countdownNoSubEvents:
    'Add Save-the-Date cards to count down to one of them instead.',
  countdownAfter: 'After it has happened, show instead',
  countdownAfterHint: 'We\u2019re married! Thank you for celebrating with us.',
  countdownSave: 'Save countdown',
  noticeTitle: 'Day-before notice',
  noticeLead:
    'A card guests see once, in the last 24 hours \u2014 with the date, the venue and directions. A guest who does not open the invitation in time is shown it the next time they do.',
  noticeOn: 'On',
  noticeOff: 'Off',
  noticeBody: 'What it says',
  noticeBodyHint:
    'We\u2019re almost there \u2014 we can\u2019t wait to celebrate with you.',
  noticeMissed: 'What it says afterwards',
  noticeMissedHint: 'We hope you had a wonderful time.',
  noticeMissedWhy:
    'Shown to a guest who only opens the invitation after the day, so they are not told about something that has already happened.',
  artworkOpen: 'Open full size',
  artworkClose: 'Close',
  /* Said under the send button, because it is the promise the button makes. */
  sendNeedsArtwork: 'Upload the invitation before sending it for approval.',
  sendNote:
    'Your customer reviews it and approves it. Nothing reaches a guest until they do.',
  resendNote:
    'Sending again puts the invitation back in front of your customer for approval.',
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
  awaitingHint:
    'Only the customer can approve — you’ll be notified when they do.',
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
  timezone: 'Event timezone',
  timezoneHint: 'The countdown guests see is calculated in this zone.',
  postEventMessage: 'After the event starts, show instead',
  postEventHint: 'Replaces the countdown once the start time passes.',

  // --- Save the date cards (F4) ---
  subEventsTitle: 'Save the date cards',
  subEventsHint:
    'One card per event. Guests see them in this order, each with its own Add to Calendar button.',
  subEventsEmpty: 'No events yet — add the first one below.',
  subEventAdd: 'Add an event',
  subEventsSave: 'Save the dates',
  subEventsUnsaved: 'Unsaved changes',
  subEventUnnamed: 'Untitled event',
  subEventNoDate: 'No date yet',
  subName: 'Event name',
  subDate: 'Date',
  subStart: 'Starts',
  subEnd: 'Ends',
  subEndHint:
    'Leave the end time blank and the calendar entry runs for three hours.',
  subTimezone: 'Timezone',
  subVenueName: 'Venue name',
  subVenueAddress: 'Venue address',
  subAddressHint:
    'Used for the calendar entry’s location and the guest’s directions link.',
  subDressCode: 'Dress code',
  subNote: 'Special note',
  subColour: 'Card colour',
  subColourNone: 'Default',
  /* ---- F5: the live stream, per sub-event ---- */
  liveTitle: 'Live Stream',
  liveHint:
    'Switch it on when the event starts. Guests invited to this event see a LIVE badge, a pop-up and the player \u2014 nobody else does.',
  liveOn: 'Live now',
  /* On the row itself, because going live is done in a hurry: the organizer
     is standing at the back of a ceremony, not reading a settings panel. */
  liveGoLive: (name: string) => `Put ${name} on air`,
  liveEndLive: (name: string) => `Take ${name} off air`,
  liveSetUp: (name: string) => `Set up the live stream for ${name}`,
  liveRowHint: 'Tap the broadcast dot on an event to put it on air.',
  liveOff: 'Off air',
  liveStreamTitle: 'Stream title',
  liveStreamTitleHint: 'Watch the Ceremony Live',
  liveUrl: 'Stream URL',
  liveUrlHint:
    'Paste the link you would share \u2014 a YouTube or Vimeo watch link is turned into its embed link for you. YouTube, Vimeo, Twitch, Facebook and Cloudflare Stream, over https.',
  liveUrlPlaceholder: 'https://www.youtube.com/embed/\u2026',
  live360Url: '360\u00b0 stream URL (optional)',
  liveVrUrl: 'VR stream URL (optional)',
  liveAltHint:
    'Leave these blank and guests simply do not see the 360\u00b0 and VR buttons \u2014 they are only offered when there is a feed behind them.',
  liveNeedsUrl: 'Add a stream URL before switching this on.',
  /* The state in a sentence. A url pasted with the switch still off is the
     easiest thing in this panel to mistake for "done". */
  liveOffAir:
    'Off air \u2014 nobody sees a stream yet. Turn on \u201cLive now\u201d, then press Save the dates.',
  liveUnsaved: 'On air once you press Save the dates.',
  liveStartedAt: (when: string) => `On air since ${when}`,
  subVisibility: 'Shown to',
  subVisibleAll: 'All guests',
  subVisibleHidden: 'Nobody — hidden for now',
  subVisibilityHint:
    'Who sees this card is decided on the server, from the guest\u2019s own group \u2014 a hidden or untargeted card never reaches them.',
  subHidden: 'Hidden',
  subMoveUp: 'Move up',
  subMoveDown: 'Move down',
  subRemove: 'Remove event',
  venueName: 'Venue',
  venueAddress: 'Address',
  message: 'Invitation message',
  rsvp: 'Collect RSVPs',
  rsvpDeadline: 'RSVP by',
  rsvpPlusOnes: 'Allow plus-ones',
  youreInvited: 'YOU’RE INVITED',
  scroll: 'SCROLL',
  previewEmpty:
    'Every section is hidden — turn one back on to show guests something.',
  loading: 'Loading the invitation…',
  errorTitle: 'We couldn’t load this invitation',
  errorBody: 'Check your connection and try again.',
  saving: 'Saving…',
  savedJustNow: 'All changes saved',
  asksTitle: 'Change requests from your customer',
  asksWhole: 'The invitation overall',
  asksResolve: 'Mark done',
} as const;
