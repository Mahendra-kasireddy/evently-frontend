import { apiClient } from '@lib/api';
import { baseApi, toQueryResult } from '@lib/rtk';
import { SEND_OTP_ENDPOINT, VERIFY_OTP_ENDPOINT } from './constants';
import type { MobileFormValues, OtpResponse } from './types';

/** Server response for a verified OTP. */
export interface VerifyOtpResult {
  token: string;
  refreshToken?: string;
  isNewUser?: boolean;
  user?: { id: string; name?: string; email?: string; city?: string; roles?: string[] };
}

/**
 * True when the account still needs the welcome steps: a fresh signup, or one
 * that never got as far as saving a name and a city. Shared by the login screen
 * and the in-place auth dialog so both route the same way.
 */
export function needsOnboarding(result: VerifyOtpResult): boolean {
  return result.isNewUser === true || !result.user?.name?.trim() || !result.user?.city?.trim();
}

async function sendOtpRequest(body: MobileFormValues): Promise<OtpResponse> {
  const { data } = await apiClient.post<OtpResponse>(SEND_OTP_ENDPOINT, body);
  return data;
}

async function verifyOtpRequest(args: {
  requestId: string;
  code: string;
}): Promise<VerifyOtpResult> {
  const { data } = await apiClient.post<VerifyOtpResult>(VERIFY_OTP_ENDPOINT, args);
  return data;
}

/** OTP login endpoints as RTK Query mutations (consistent with the rest of the app). */
export const loginApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    sendOtp: build.mutation<OtpResponse, MobileFormValues>({
      queryFn: (body) => toQueryResult(() => sendOtpRequest(body)),
    }),
    verifyOtp: build.mutation<VerifyOtpResult, { requestId: string; code: string }>({
      queryFn: (args) => toQueryResult(() => verifyOtpRequest(args)),
    }),
  }),
});

export const { useSendOtpMutation, useVerifyOtpMutation } = loginApi;
