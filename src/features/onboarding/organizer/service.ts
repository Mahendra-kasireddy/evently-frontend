import { baseApi, toQueryResult } from '@lib/rtk';
import type { BasicInfoValues } from './types';

/**
 * Organizer onboarding data access. Mock today; swap for the apiClient call
 * (e.g. apiClient.post('/organizers/onboarding/basic', values)) when ready.
 */
export async function saveBasicInfo(values: BasicInfoValues): Promise<{ ok: true }> {
  await new Promise((r) => setTimeout(r, 500));
  void values;
  return { ok: true };
}

export const organizerOnboardingApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    saveBasicInfo: build.mutation<{ ok: true }, BasicInfoValues>({
      queryFn: (values) => toQueryResult(() => saveBasicInfo(values)),
    }),
  }),
});

export const { useSaveBasicInfoMutation } = organizerOnboardingApi;
