import { baseApi, toQueryResult } from '@lib/rtk';
import type { SubvendorDraft } from './types';

/** Mock submit. Swap for apiClient.post('/subvendors/onboard', draft) later. */
export async function finishSubvendorOnboarding(draft: SubvendorDraft): Promise<{ ok: true }> {
  await new Promise((r) => setTimeout(r, 600));
  void draft;
  return { ok: true };
}

export const subvendorOnboardingApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    finishSubvendorOnboarding: build.mutation<{ ok: true }, SubvendorDraft>({
      queryFn: (draft) => toQueryResult(() => finishSubvendorOnboarding(draft)),
    }),
  }),
});

export const { useFinishSubvendorOnboardingMutation } = subvendorOnboardingApi;
