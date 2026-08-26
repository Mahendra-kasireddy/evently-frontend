import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';

/**
 * Single RTK Query API. Features extend it via `injectEndpoints`, so there's
 * one cache + one slice of the store. `fakeBaseQuery` lets endpoints supply
 * their own `queryFn` today (mock JSON) and swap to a real baseQuery later.
 */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fakeBaseQuery(),
  /**
   * Data can change in another session entirely — an organizer sending a quote,
   * a sub-vendor accepting a task — and a tag invalidated in *their* browser
   * cannot reach this one. Revalidating active queries when the window regains
   * focus (or the connection returns) is what keeps a long-open tab honest,
   * without polling. Requires `setupListeners` in the store.
   */
  refetchOnFocus: true,
  refetchOnReconnect: true,
  tagTypes: [
    'CustomerHome',
    'Profile',
    'Notifications',
    'Quotes',
    'Plans',
    'Bookings',
    'OrganizerProfile',
    'OrganizerPreview',
    'OrganizerQuotes',
    'OrganizerBookings',
    'SubVendorTasks',
    'SubVendorLinks',
    'Academy',
    'Invitation',
    'InvitationGuests',
    'Ideas',
  ],
  endpoints: () => ({}),
});
