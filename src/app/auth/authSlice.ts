import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { getToken } from '@lib/api';
import type { AuthState, SessionUser } from './types';

/**
 * Auth session state — now in the Redux store (was React Context).
 * Initial status is derived from the persisted token so a refresh keeps the
 * user signed in. Token side-effects (localStorage) live in the useAuth hook,
 * keeping this reducer pure.
 */
const initialState: AuthState = {
  status: getToken() ? 'authenticated' : 'unauthenticated',
  user: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    signedIn: (state, action: PayloadAction<SessionUser>) => {
      state.status = 'authenticated';
      state.user = action.payload;
    },
    signedOut: (state) => {
      state.status = 'unauthenticated';
      state.user = null;
    },
  },
});

export const { signedIn, signedOut } = authSlice.actions;
export const selectAuth = (state: { auth: AuthState }) => state.auth;
