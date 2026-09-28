/**
 * Save-the-Date card helpers, shared by the guest render and the builder.
 *
 * Kept out of the components because both sides need the same answers, and a
 * guest must never see a card the organizer hid — that filter existing in one
 * place is what makes it hard to forget in the other.
 */

import type {
  CardColour,
  GuestLive,
  InvitationSubEvent,
  InvitationTemplate,
  LiveStreamMode,
} from './types';

/**
 * The cards worth previewing in the builder.
 *
 * Hidden cards are builder-only state and a card with no name is not a card
 * yet; everything else is shown, including one targeted at particular guest
 * groups — the organizer is previewing the invitation, not standing in for
 * one guest.
 *
 * Which guest actually receives which card is decided on the server and cannot
 * be decided here: the guest page is handed a list that is already theirs, so
 * it does no filtering at all.
 */
export function guestSubEvents(
  subEvents: InvitationSubEvent[],
): InvitationSubEvent[] {
  return subEvents.filter(
    (e) => e.visibility !== 'hidden' && e.name.trim() !== '',
  );
}

/** `2026-12-26` → `Saturday`; '' or malformed → ''. */
export function dayOfWeekLabel(day: string): string {
  if (!day) return '';
  const d = new Date(`${day}T00:00:00`);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { weekday: 'long' });
}

/** `2026-12-26` → `26 December 2026`; '' or malformed → ''. */
export function cardDateLabel(day: string): string {
  if (!day) return '';
  const d = new Date(`${day}T00:00:00`);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export interface CardStyle {
  background: string;
  color: string;
  /** A rule and border colour derived from the ink, so one token drives both. */
  border: string;
}

/**
 * A card's colours: its own palette entry when the organizer picked one, and
 * the invitation's template otherwise.
 *
 * Resolved from the palette the API served rather than from a local table, so
 * a colour the server does not offer cannot be rendered even if it somehow
 * reached the client.
 */
export function cardStyle(
  colourId: string,
  palette: CardColour[],
  template: InvitationTemplate | undefined,
): CardStyle {
  const picked = palette.find((c) => c.id === colourId);
  if (picked) {
    return {
      background: picked.wash,
      color: picked.ink,
      border: `${picked.ink}22`,
    };
  }
  // No colour picked: a plain card on the template's wash, with the template's
  // accent as the rule so it still reads as part of the same invitation.
  return {
    background: '#ffffff',
    color: '#2B2B33',
    border: template?.accent ? `${template.accent}55` : 'rgba(20,22,34,.10)',
  };
}

/** A Google Maps link for a venue, or '' when there is no address to open. */
export function mapsUrl(venueName: string, venueAddress: string): string {
  const query = [venueName, venueAddress]
    .filter((v, i, all) => v && all.indexOf(v) === i)
    .join(', ');
  if (!query) return '';
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/**
 * The event that is on air, out of a list of raw sub-events.
 *
 * For the surfaces that are given the invitation's own cards rather than the
 * guest payload: the organizer's preview and the customer's review screen.
 * The guest page does not use this — it is handed a stream or null by the
 * server, because who may watch is a decision that has to happen there.
 *
 * The rule is the server's, restated: switched on, and with somewhere to
 * watch. A stream toggled on with no url is not live, and a LIVE badge over
 * an empty player is worse than no badge.
 */
export function liveSubEventOf(
  subEvents: InvitationSubEvent[],
): InvitationSubEvent | null {
  return (
    subEvents.find(
      (e) => e.liveEnabled === true && (e.liveUrl ?? '').trim() !== '',
    ) ?? null
  );
}

/**
 * That card, in the shape `LiveStreamBlock` draws — so the customer reviews
 * the very component their guests will see, not a second rendering of it.
 */
export function liveViewOf(event: InvitationSubEvent): GuestLive {
  const modes: LiveStreamMode[] = [
    { id: 'standard', url: (event.liveUrl ?? '').trim() },
  ];
  /* Only the modes with a feed behind them, exactly as the server decides. */
  if ((event.live360Url ?? '').trim()) {
    modes.push({ id: '360', url: (event.live360Url ?? '').trim() });
  }
  if ((event.liveVrUrl ?? '').trim()) {
    modes.push({ id: 'vr', url: (event.liveVrUrl ?? '').trim() });
  }
  return {
    subEventId: event.id,
    name: event.name,
    title: (event.liveTitle ?? '').trim() || 'Watch the ceremony live',
    modes,
    startedAt: event.liveStartedAt ?? '',
    venueName: event.venueName,
    venueAddress: event.venueAddress,
    eventDate: event.eventDate,
    eventTime: event.eventTime,
    timezone: event.timezone,
    dressCode: event.dressCode,
  };
}

/** A blank card for the builder's "add" action. */
export function emptySubEvent(timezone: string): InvitationSubEvent {
  return {
    id: '',
    name: '',
    eventDate: '',
    eventTime: '',
    endTime: '',
    timezone,
    venueName: '',
    venueAddress: '',
    dressCode: '',
    note: '',
    colour: '',
    visibility: 'all',
    groups: [],
  };
}
