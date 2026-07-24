import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';

/**
 * Single RTK Query API. Features extend it via `injectEndpoints`, so there's
 * one cache + one slice of the store. `fakeBaseQuery` lets endpoints supply
 * their own `queryFn` today (mock JSON) and swap to a real baseQuery later.
 */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fakeBaseQuery(),
  tagTypes: [
    'CustomerHome',
    'Profile',
    'Notifications',
    'Quotes',
    'Plans',
    'Bookings',
    'OrganizerProfile',
  ],
  endpoints: () => ({}),
});
