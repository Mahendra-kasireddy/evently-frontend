import { apiClient } from '@lib/api';
import { baseApi, toQueryResult } from '@lib/rtk';
import type { AccountDetails } from './types';

/**
 * Account settings reuse the existing user endpoints — there is no second
 * account system for sub-vendors. `PATCH /user/updateProfile` takes
 * `UpdateProfileDto`, which deliberately declares neither `roles` nor
 * `status`, so this cannot escalate a role however it is called.
 */
export interface UpdateAccountArgs {
  name?: string;
  email?: string;
  city?: string;
}

export const subVendorSettingsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAccountDetails: build.query<AccountDetails, void>({
      queryFn: () =>
        toQueryResult(
          async () => (await apiClient.get<AccountDetails>('/user/getUserDetails')).data,
        ),
      providesTags: ['Profile'],
    }),

    updateAccountDetails: build.mutation<AccountDetails, UpdateAccountArgs>({
      queryFn: (body) =>
        toQueryResult(
          async () => (await apiClient.patch<AccountDetails>('/user/updateProfile', body)).data,
        ),
      invalidatesTags: ['Profile'],
    }),
  }),
});

export const { useGetAccountDetailsQuery, useUpdateAccountDetailsMutation } =
  subVendorSettingsApi;
