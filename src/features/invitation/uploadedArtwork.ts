import type { InvitationDetails } from './types';

/** The invitation the organizer uploaded, or null while there is none. */
export interface InvitationArtwork {
  kind: 'image' | 'video';
  url: string;
  /** Videos only, in seconds, as the uploading client measured it. */
  seconds: number;
}

/**
 * What the organizer uploaded, if they have uploaded anything.
 *
 * An invitation is a design — made in whatever tool the organizer already
 * designs in — so the platform stores the finished artwork rather than trying
 * to rebuild it out of form fields. Every surface reads this one function, so
 * "is there an invitation yet" is answered in one place: the builder, the
 * guest page and the customer's app all agree by construction.
 */
export function artworkOf(
  details: InvitationDetails,
): InvitationArtwork | null {
  const url = (details.heroMediaUrl ?? '').trim();
  const kind = details.heroMediaType ?? '';
  /* Half a record is not an invitation: a url with no type behind it would
     render as a broken image rather than as "nothing uploaded yet". */
  if (!url || (kind !== 'image' && kind !== 'video')) return null;
  return { kind, url, seconds: details.heroMediaDurationSec ?? 0 };
}
