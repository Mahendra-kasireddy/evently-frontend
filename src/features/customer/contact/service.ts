import { apiClient } from '@lib/api';
import { baseApi, toQueryResult } from '@lib/rtk';
import type { ContactFormValues, ContactPrefill, ContactReceipt } from './types';

/**
 * Contact Us data layer.
 *
 * `submitContactRequest` carries no user id: the backend derives the owning
 * account from the access token when one is sent, and treats the message as a
 * guest submission when it is not. The client cannot claim an identity here.
 */
export const contactApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    submitContactRequest: build.mutation<ContactReceipt, ContactFormValues>({
      queryFn: (body) =>
        toQueryResult(
          async () => (await apiClient.post<ContactReceipt>('/contact-us', body)).data,
        ),
      // A signed-in customer gets an in-app receipt, so the bell must refresh.
      invalidatesTags: ['Notifications'],
    }),

    /** Only fired when signed in — the caller skips it for a guest. */
    getContactPrefill: build.query<ContactPrefill, void>({
      queryFn: () =>
        toQueryResult(
          async () => (await apiClient.get<ContactPrefill>('/contact-us/prefill')).data,
        ),
      providesTags: ['Profile'],
    }),
  }),
});

export const { useSubmitContactRequestMutation, useGetContactPrefillQuery } = contactApi;
