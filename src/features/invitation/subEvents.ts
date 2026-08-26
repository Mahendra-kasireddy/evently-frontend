/**
 * Save-the-Date card helpers, shared by the guest render and the builder.
 *
 * Kept out of the components because both sides need the same answers, and a
 * guest must never see a card the organizer hid — that filter existing in one
 * place is what makes it hard to forget in the other.
 */

import type { CardColour, InvitationSubEvent, InvitationTemplate } from './types';

/**
 * The cards a guest actually sees.
 *
 * A card is shown when the organizer marked it visible to all guests and it has
 * a name to show. Anything else is builder-only state, not guest content.
 *
 * F4's "cards for events the guest is not invited to are not shown" needs a
 * guest identity to compare against, and there is none yet; when invitee
 * records exist this is the single place that gains the check.
 */
export function guestSubEvents(subEvents: InvitationSubEvent[]): InvitationSubEvent[] {
  return subEvents.filter((e) => e.visibility === 'all' && e.name.trim() !== '');
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
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
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
    return { background: picked.wash, color: picked.ink, border: `${picked.ink}22` };
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
  };
}
