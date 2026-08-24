/**
 * My Events route map.
 *
 * The whole request → response → comparison → review journey lives under one
 * path prefix, so the "My events" nav item stays selected the entire way
 * (CustomerLayout marks it active with `pathname.startsWith`) and the URL itself
 * tells the customer which section they are in.
 *
 *   /workspace                                the hub: every event, its responses
 *   /workspace/booked/:bookingId              a booked event's workspace
 *   /workspace/booked/:bookingId/ideas        its ideas & planning board
 *   /workspace/booked/:bookingId/invitation   its guest invitation
 *   /workspace/:requestId                     one event: compare its responses
 *   /workspace/:requestId/:quotationId        one response: full breakdown, act
 *
 * `booked` is a static segment, which React Router ranks above the dynamic
 * `:requestId` — so a request id can never be swallowed by the workspace route.
 */
export const MY_EVENTS_ROUTE = '/workspace';

export function eventRoute(requestId: string): string {
  return `${MY_EVENTS_ROUTE}/${encodeURIComponent(requestId)}`;
}

export function responseRoute(requestId: string, quotationId: string): string {
  return `${eventRoute(requestId)}/${encodeURIComponent(quotationId)}`;
}

/** The workspace for a booked event — where "Open workspace" leads. */
export function bookedWorkspaceRoute(bookingId: string): string {
  return `${MY_EVENTS_ROUTE}/booked/${encodeURIComponent(bookingId)}`;
}

/** That event's ideas & planning board. */
export function ideasRoute(bookingId: string): string {
  return `${bookedWorkspaceRoute(bookingId)}/ideas`;
}

/**
 * That event's guest invitation. Nested under the booking so the invitation is
 * always reviewed in the context of the event it belongs to, and so "back" has
 * an unambiguous destination.
 */
export function invitationRoute(bookingId: string): string {
  return `${bookedWorkspaceRoute(bookingId)}/invitation`;
}
