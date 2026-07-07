/** Minimal session user held in client state. Feature DTOs may carry more. */
export interface SessionUser {
  id: string;
  email: string;
  name: string;
}

export type AuthStatus = 'authenticated' | 'unauthenticated';

export interface AuthState {
  status: AuthStatus;
  user: SessionUser | null;
}
