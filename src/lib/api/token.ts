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
