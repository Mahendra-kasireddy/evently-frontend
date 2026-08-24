import { apiClient } from '@lib/api';
import { baseApi, toQueryResult } from '@lib/rtk';

export interface ProfilePatch {
  name?: string;
  city?: string;
}

export interface UpdatedUser {
  id: string;
  name: string;
  city: string;
}

/**
 * Onboarding writes straight to the existing self-service profile endpoint —
 * no new backend surface. Invalidating `Profile` refreshes the header greeting
 * and location strip, and `CustomerHome` re-resolves the location-dependent
 * sections for the newly chosen city.
 */
export const welcomeApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    saveProfileBasics: build.mutation<UpdatedUser, ProfilePatch>({
      queryFn: (body) =>
        toQueryResult(
          async () => (await apiClient.patch<UpdatedUser>('/user/updateProfile', body)).data,
        ),
      invalidatesTags: ['Profile', 'CustomerHome'],
    }),
    getCityOptions: build.query<string[], void>({
      queryFn: () => toQueryResult(async () => (await apiClient.get<string[]>('/plan/cities')).data),
    }),
  }),
});

export const { useSaveProfileBasicsMutation, useGetCityOptionsQuery } = welcomeApi;
