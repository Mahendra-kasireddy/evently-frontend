import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from '@lib/rtk';
import { authSlice } from './auth/authSlice';
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
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
