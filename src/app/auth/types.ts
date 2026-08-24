/** Minimal session user held in client state. Feature DTOs may carry more. */
export interface SessionUser {
  id: string;
  email: string;
  name: string;
}

/** Mirrors the backend's Role enum (evently-BackEnd user.schema.ts). */
export type Role = 'customer' | 'organizer' | 'vendor' | 'admin';

export type AuthStatus = 'authenticated' | 'unauthenticated';

export interface AuthState {
  status: AuthStatus;
  user: SessionUser | null;
  /**
   * Tracked independently of `user` (not nested inside it) because `user` is
   * not rehydrated from the backend on a hard page refresh — it stays `null`
   * until the next login. `roles` is decoded straight from the persisted JWT
   * at store-init time instead, so role-gated routes survive a refresh.
   */
  roles: Role[];
}
