import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { baseApi } from '@lib/rtk';
import { onSessionEnd } from '@lib/api';
import { authSlice, signedOut } from './auth/authSlice';
import { heroDraftSlice } from '@features/customer/home/service';
import { planSlice } from '@features/customer/plan/service';

/** Production Redux store. RTK Query api reducer + middleware are wired in. */
export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    [authSlice.name]: authSlice.reducer,
    [heroDraftSlice.name]: heroDraftSlice.reducer,
    [planSlice.name]: planSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

// Wires the focus/reconnect events RTK Query's refetchOnFocus/refetchOnReconnect
// listen for. Without this they are silently inert.
setupListeners(store.dispatch);

// A session that ends on its own (refresh refused) signs the app out, so the
// route guards send the user to the login screen.
onSessionEnd(() => store.dispatch(signedOut()));

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
