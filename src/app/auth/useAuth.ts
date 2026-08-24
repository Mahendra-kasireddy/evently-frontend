import { useCallback } from 'react';
import { decodeJwtRoles, getToken, setToken } from '@lib/api';
import { useAppDispatch, useAppSelector } from '../hooks';
import { signedIn, signedOut, rolesUpdated, selectAuth } from './authSlice';
import type { Role, SessionUser } from './types';

export interface UseAuthResult {
  status: 'authenticated' | 'unauthenticated';
  user: SessionUser | null;
  roles: Role[];
  /** Persist the token and mark the session authenticated. */
  signIn: (user: SessionUser, token: string, roles?: Role[]) => void;
  /** Clear the token and drop to unauthenticated. */
  signOut: () => void;
  /**
   * Re-derive `roles` from the currently persisted token. Used after a flow
   * that reissues the token with an added role (e.g. organizer onboarding's
   * register step) so the store reflects it without a re-login.
   */
  refreshRolesFromToken: () => void;
}

/** Access the auth session from the Redux store. */
export function useAuth(): UseAuthResult {
  const dispatch = useAppDispatch();
  const { status, user, roles } = useAppSelector(selectAuth);

  const signIn = useCallback(
    (u: SessionUser, token: string, roles: Role[] = ['customer']) => {
      setToken(token);
      dispatch(signedIn({ user: u, roles }));
    },
    [dispatch],
  );

  const signOut = useCallback(() => {
    setToken(null);
    dispatch(signedOut());
  }, [dispatch]);

  const refreshRolesFromToken = useCallback(() => {
    const token = getToken();
    dispatch(rolesUpdated(token ? (decodeJwtRoles(token) as Role[]) : []));
  }, [dispatch]);

  return { status, user, roles, signIn, signOut, refreshRolesFromToken };
}
