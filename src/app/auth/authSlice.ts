import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { decodeJwtRoles, getToken } from '@lib/api';
import type { AuthState, Role, SessionUser } from './types';

/**
 * Auth session state — now in the Redux store (was React Context).
 * Initial status is derived from the persisted token so a refresh keeps the
 * user signed in. Token side-effects (localStorage) live in the useAuth hook,
 * keeping this reducer pure. `roles` is decoded from that same persisted
 * token (not read from `user`, which stays null until the next login) so
 * role-gated routes work correctly immediately after a page refresh.
 */
const initialToken = getToken();
const initialState: AuthState = {
  status: initialToken ? 'authenticated' : 'unauthenticated',
  user: null,
  roles: initialToken ? (decodeJwtRoles(initialToken) as Role[]) : [],
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    signedIn: (state, action: PayloadAction<{ user: SessionUser; roles: Role[] }>) => {
      state.status = 'authenticated';
      state.user = action.payload.user;
      state.roles = action.payload.roles;
    },
    signedOut: (state) => {
      state.status = 'unauthenticated';
      state.user = null;
      state.roles = [];
    },
    rolesUpdated: (state, action: PayloadAction<Role[]>) => {
      state.roles = action.payload;
    },
  },
});

export const { signedIn, signedOut, rolesUpdated } = authSlice.actions;
export const selectAuth = (state: { auth: AuthState }) => state.auth;
