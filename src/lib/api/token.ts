/**
 * Single source of truth for the auth token used by the axios interceptor.
 *
 * Kept deliberately tiny and framework-agnostic so both the API layer and the
 * client-state auth store can read/write it without a circular dependency.
 * Swap the storage backend (memory <-> httpOnly cookie flow) here only.
 */
const STORAGE_KEY = 'evently.auth.token';

let inMemoryToken: string | null = null;

export function getToken(): string | null {
  if (inMemoryToken !== null) return inMemoryToken;
  try {
    inMemoryToken = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    inMemoryToken = null;
  }
  return inMemoryToken;
}

export function setToken(token: string | null): void {
  inMemoryToken = token;
  try {
    if (token === null) window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, token);
  } catch {
    /* storage unavailable (private mode / SSR) — in-memory value still holds */
  }
}

/*
 * The refresh token (7 days, rotated on every use). Kept beside the access
 * token so a 1-hour access token can be renewed instead of signing the
 * customer out — see the 401 handling in ./client.
 */
const REFRESH_KEY = 'evently.auth.refresh';
let inMemoryRefresh: string | null | undefined;

export function getRefreshToken(): string | null {
  if (inMemoryRefresh !== undefined) return inMemoryRefresh;
  try {
    inMemoryRefresh = window.localStorage.getItem(REFRESH_KEY);
  } catch {
    inMemoryRefresh = null;
  }
  return inMemoryRefresh;
}

export function setRefreshToken(token: string | null | undefined): void {
  inMemoryRefresh = token ?? null;
  try {
    if (!token) window.localStorage.removeItem(REFRESH_KEY);
    else window.localStorage.setItem(REFRESH_KEY, token);
  } catch {
    /* storage unavailable — in-memory value still holds */
  }
}

/*
 * Told when the session ends without the user pressing "Log out" — the
 * refresh token was refused. The app marks itself signed out so the router
 * sends them to the login screen, instead of leaving a page with no data.
 */
const sessionEndListeners = new Set<() => void>();

export function onSessionEnd(listener: () => void): () => void {
  sessionEndListeners.add(listener);
  return () => sessionEndListeners.delete(listener);
}

/** Both tokens at once: what a sign-in stores, and what a sign-out clears. */
export function setSession(
  token: string | null,
  refreshToken?: string | null,
): void {
  const hadSession = getToken() !== null;
  setToken(token);
  setRefreshToken(token ? (refreshToken ?? null) : null);
  if (!token && hadSession) sessionEndListeners.forEach((l) => l());
}
