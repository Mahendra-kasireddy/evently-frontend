/**
 * What to tell the organizer when a load fails.
 *
 * The server already said something specific — "No organizer profile is linked
 * to your account", "Event not found" — and the client rejects with that
 * sentence on a normalised `{ status, code, message }`. Replacing it with
 * "check your connection" is how a 403 spends an afternoon being debugged as a
 * network problem.
 *
 * Only a status of 0 is actually a connection failure. Everything else reached
 * the server and came back with an answer worth repeating.
 */
export interface LoadFailure {
  message: string;
  /** True when retrying could plausibly help. A 403 will not fix itself. */
  retryable: boolean;
}

interface NormalisedError {
  status?: number;
  code?: string;
  message?: string;
}

export function describeLoadError(error: unknown, subject: string): LoadFailure {
  const e = (error ?? {}) as NormalisedError;
  const status = e.status ?? 0;

  if (status === 0) {
    return {
      message: `We couldn't reach the server to load ${subject}. Check your connection and try again.`,
      retryable: true,
    };
  }

  if (status === 401) {
    return { message: 'Your session has expired. Sign in again to continue.', retryable: false };
  }

  if (status === 403) {
    return {
      message:
        e.message ||
        'Your account is not set up as an organizer yet, so there are no public events to show.',
      retryable: false,
    };
  }

  if (status === 404) {
    return {
      message: e.message || `We couldn't find ${subject}.`,
      retryable: false,
    };
  }

  /*
   * A 404 on the collection route is worth saying plainly: it means the server
   * is up but does not have this feature, which is almost always a backend
   * that has not been restarted since it was added.
   */
  if (status >= 500) {
    return {
      message: e.message || `The server ran into a problem loading ${subject}.`,
      retryable: true,
    };
  }

  return { message: e.message || `We couldn't load ${subject}.`, retryable: true };
}

/**
 * Whether this looks like a backend that does not know the route yet.
 *
 * Nest answers an unknown path with a 404 whose message names it. On the
 * collection route — where a 404 cannot mean "that one event is missing" —
 * that is worth saying outright rather than letting the organizer hunt.
 */
export function looksLikeMissingRoute(error: unknown): boolean {
  const e = (error ?? {}) as NormalisedError;
  if (e.status !== 404) return false;
  return /cannot\s+(get|post|patch|delete)/i.test(e.message ?? '');
}
