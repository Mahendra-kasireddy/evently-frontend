import { apiClient } from '@lib/api';
import { baseApi, toQueryResult } from '@lib/rtk';
import type { SubvendorDraft } from './types';

export interface OnboardSubvendorResult {
  profile: {
    id: string;
    fullName: string;
    initials: string;
    avatarColor: string;
    category: string;
    /** The vendor's own words, when `category` is 'other'. */
    customCategory: string;
    serviceArea: string;
    baseRate: number;
    baseRateUnit: string;
    minOrder: number;
  };
  token: string;
  refreshToken: string;
}

async function onboardSubvendor(draft: SubvendorDraft): Promise<OnboardSubvendorResult> {
  const body = {
    fullName: draft.fullName,
    categoryId: draft.categoryId,
    // Sent only for 'other'; the hook already blanks it otherwise, and the
    // server ignores it for every real category.
    customCategory: draft.customCategory.trim() || undefined,
    serviceArea: draft.serviceArea,
    baseRate: draft.baseRate ? Number(draft.baseRate) : undefined,
    minOrder: draft.minOrder ? Number(draft.minOrder) : undefined,
    organizerPhone: draft.organizerPhone.replace(/\D/g, '') || undefined,
  };
  const { data } = await apiClient.post<OnboardSubvendorResult>('/subvendor/onboard', body);
  return data;
}

export const subvendorOnboardingApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    finishSubvendorOnboarding: build.mutation<OnboardSubvendorResult, SubvendorDraft>({
      queryFn: (draft) => toQueryResult(() => onboardSubvendor(draft)),
    }),
  }),
});

export const { useFinishSubvendorOnboardingMutation } = subvendorOnboardingApi;
