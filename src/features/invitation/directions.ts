/**
 * A Google Maps link to a venue.
 *
 * Built from the venue the invitation actually stores rather than a pasted
 * URL, so it can never point at last event's hall. The platform holds no
 * coordinates for an invitation venue — only a name and an address — so this
 * is the place-search directions form, which is what Google documents for a
 * destination given as text, and it takes the guest's own location as the
 * origin rather than assuming one.
 *
 * Returns '' when there is no venue worth asking about, and the caller then
 * offers no directions at all rather than a button that opens a search for
 * nothing.
 */
export function directionsUrl(venueName: string, venueAddress: string): string {
  const parts = [venueName, venueAddress]
    .map((part) => (part ?? '').trim())
    .filter(Boolean)
    /* Organizers routinely paste the address into both fields; one of them is
       then the whole destination and the other is a repeat of it. */
    .filter(
      (part, index, all) => all.findIndex((other) => other === part) === index,
    );

  const destination = parts.join(', ').trim();
  if (!destination) return '';

  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}
