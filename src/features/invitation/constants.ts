import {
  Calendar,
  Camera,
  Car,
  Clock,
  Image as ImageIcon,
  LayoutGrid,
  PlayCircle,
  QrCode,
  Sparkles,
  TreePine,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * Section-catalogue glue shared by the organizer's builder and the customer's
 * review screen. The catalogue itself lives on the server (invitation-defaults)
 * — this only maps its icon names to glyphs and formats its stored date strings.
 */

/** API icon name → lucide glyph. Unknown names fall back to a generic tile. */
export const BLOCK_ICON: Record<string, LucideIcon> = {
  image: ImageIcon,
  sparkles: Sparkles,
  clock: Clock,
  calendar: Calendar,
  play: PlayCircle,
  camera: Camera,
  users: Users,
  car: Car,
  qr: QrCode,
  tree: TreePine,
};

export const FALLBACK_BLOCK_ICON: LucideIcon = LayoutGrid;

/** Sections whose guest-facing body is generated rather than typed. */
/** What the story says, and what it is called to a screen reader. */
export const STORY_COPY = {
  title: 'Our story',
  trackLabel: 'Story cards. Swipe, or use the left and right arrow keys.',
  slideLabel: (n: number, total: number) => `Card ${n} of ${total}`,
  photoAlt: (n: number) => `Story photograph ${n}`,
  openPhoto: (n: number) => `Open photograph ${n} full size`,
  goTo: (n: number) => `Go to card ${n}`,
  position: (n: number, total: number) => `${n} / ${total}`,
  close: 'Close photograph',
};

/** The countdown's own words, and what it is called to a screen reader. */
export const COUNTDOWN_COPY = {
  label: 'Countdown to the event',
  countdownTo: 'Countdown to',
  remaining: 'Time remaining',
  days: 'Days',
  hours: 'Hours',
  minutes: 'Minutes',
  seconds: 'Seconds',
  started: 'The celebration has begun.',
};

/** The night-before notice. One dismissal, worded as what it means. */
export const NOTIFICATION_COPY = {
  /*
   * The card's own heading, by state. The organizer writes the message under
   * it; this is the greeting, and it has to change once the day has passed —
   * "you're almost there" the morning after a wedding is not true.
   */
  upcomingTitle: 'You\u2019re Almost There!',
  missedTitle: 'Thank You',
  directions: 'Get Directions',
  dismiss: 'Got it, see you there!',
};

/** Save the Date's own words. */
export const SAVE_THE_DATE_COPY = {
  title: 'Save the Date',
  lead: 'Celebrate every beautiful moment with us',
  dressCode: 'Dress code',
  add: 'Add to Calendar',
  addToGoogle: 'Add to Google Calendar instead',
  noDate: 'This celebration has no date yet',
};

/** The live stream's own words. */
export const LIVE_COPY = {
  /* The badge, everywhere it appears. Uppercase in the markup rather than in
     CSS, because a screen reader should read "LIVE" and not "live". */
  live: 'LIVE',
  liveNow: 'LIVE NOW',
  happeningNow: 'is happening now!',
  watching: (n: number) => `${n} watching`,
  watch: 'Watch Live',
  dismiss: 'Dismiss',
  entryHint: 'Watch the Ceremony Live',
  sectionTitle: 'Live Stream',
  playerLabel: 'Live stream player',
  bannerClose: 'Dismiss the live notice',
  eventDetails: 'Event Details',
  dressCode: 'Dress Code',
  modes: {
    standard: 'Standard',
    '360': '360°',
    vr: 'VR',
  } as const,
  modeLabel: 'How to watch',
  fullScreen: 'Watch full screen',
  offline: 'The stream has ended.',
};

export const COUNTDOWN_BLOCK = 'countdown';
export const HEADER_BLOCK = 'header';
export const SAVE_THE_DATE_BLOCK = 'save-the-date';

/** `2026-12-28` → `SUNDAY, 28 DECEMBER 2026`. */
export function longDateLabel(day: string): string {
  if (!day) return '';
  const d = new Date(`${day}T00:00:00`);
  if (Number.isNaN(d.getTime())) return '';
  return d
    .toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    .toUpperCase();
}

/** `18:30` → `6:30 PM`; '' stays ''. */
export function timeLabel(time: string): string {
  if (!time) return '';
  const [h, m] = time.split(':');
  const hour = Number(h);
  if (Number.isNaN(hour)) return '';
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}:${m ?? '00'} ${suffix}`;
}

/** Whole days from today to the event, floored at 0. */
export function daysUntil(day: string): number {
  if (!day) return 0;
  const target = new Date(`${day}T00:00:00`).getTime();
  if (Number.isNaN(target)) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((target - today.getTime()) / 86_400_000));
}

/** Copy the guest render itself needs, on either screen. */
export const GUEST_COPY = {
  youreInvited: 'YOU’RE INVITED',
  scroll: 'SCROLL',
  previewEmpty:
    'Every section is hidden — turn one back on to show guests something.',
  /** Shown when the countdown reaches zero and no post-event message was set. */
  eventStarted: 'The celebration has begun.',
  addToCalendar: 'Add to Calendar',
  addToGoogle: 'Google Calendar instead',
  dressCode: 'Dress code',
  getDirections: 'Get directions',
  /** The Save-the-date section with no cards yet — the organizer has not added any. */
  noSubEvents: 'The schedule is still being finalised.',
} as const;
