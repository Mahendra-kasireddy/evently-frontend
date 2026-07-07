import { useCallback } from 'react';
import { setToken } from '@lib/api';
import { useAppDispatch, useAppSelector } from '../hooks';
import { signedIn, signedOut, selectAuth } from './authSlice';
import type { SessionUser } from './types';

export interface UseAuthResult {
  status: 'authenticated' | 'unauthenticated';
  user: SessionUser | null;
  /** Persist the token and mark the session authenticated. */
  signIn: (user: SessionUser, token: string) => void;
  /** Clear the token and drop to unauthenticated. */
  signOut: () => void;
}

/** Access the auth session from the Redux store. */
export function useAuth(): UseAuthResult {
  const dispatch = useAppDispatch();
  const { status, user } = useAppSelector(selectAuth);

  const signIn = useCallback(
    (u: SessionUser, token: string) => {
      setToken(token);
      dispatch(signedIn(u));
    },
    [dispatch],
  );

  const signOut = useCallback(() => {
    setToken(null);
    dispatch(signedOut());
  }, [dispatch]);

  return { status, user, signIn, signOut };
}
