/**
 * The `where` field of a quote request: "Area, City".
 *
 * Its own module rather than a helper inside ReviewStep because it enforces a
 * server bound, and a bound worth enforcing is worth testing on its own.
 */

/** What `RequestQuotesDto.where` accepts. Keep the two in step. */
export const WHERE_MAX = 120;

/**
 * Composes the two location fields, never exceeding what the API accepts.
 *
 * The Plan form caps both inputs so a fresh draft cannot overflow, but a draft
 * saved before that cap existed still can — and without this the customer is
 * stuck, unable to submit a plan they have already written, told only after the
 * plan was saved that the quote request failed.
 *
 * Dropping the area is the graceful loss: the city is what an organizer filters
 * on, so it is the half worth keeping. The final slice is a backstop for a city
 * that is itself absurd; it cannot produce a wrong location, only a clipped one.
 */
export function composeWhere(area: string, city: string): string {
  const full = [area, city]
    .map((part) => (part ?? '').trim())
    .filter(Boolean)
    .join(', ');
  if (full.length <= WHERE_MAX) return full;

  const cityOnly = (city ?? '').trim();
  if (cityOnly && cityOnly.length <= WHERE_MAX) return cityOnly;

  return full.slice(0, WHERE_MAX).trimEnd();
}
