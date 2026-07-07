import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@app/auth';
import { type NormalizedApiError } from '@lib/api';
import { useSendOtpMutation, useVerifyOtpMutation } from '../service';
import { mobileSchema, otpSchema, type LoginFieldErrors, type MobileFormValues } from '../types';

export type LoginStep = 'mobile' | 'otp';

export interface UseLoginResult {
  step: LoginStep;
  sentTo: string | undefined;
  submitMobile: (values: MobileFormValues) => void;
  mobileFieldErrors: LoginFieldErrors;
  isSending: boolean;
  sendError: NormalizedApiError | null;
  verifyCode: (code: string) => void;
  otpError: string | undefined;
  isVerifying: boolean;
  resend: () => void;
  changeNumber: () => void;
}

/** Two-step login: request OTP for a mobile number, then verify the code. */
export function useLogin(): UseLoginResult {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [step, setStep] = useState<LoginStep>('mobile');
  const [mobile, setMobile] = useState('');
  const [requestId, setRequestId] = useState('');
  const [sentTo, setSentTo] = useState<string | undefined>(undefined);
  const [mobileFieldErrors, setMobileFieldErrors] = useState<LoginFieldErrors>({});
  const [otpError, setOtpError] = useState<string | undefined>(undefined);

  const [sendOtp, sendState] = useSendOtpMutation();
  const [verifyOtp, verifyState] = useVerifyOtpMutation();

  const requestOtp = (body: MobileFormValues) => {
    sendOtp(body)
      .unwrap()
      .then((data) => {
        setRequestId(data.requestId);
        setSentTo(data.sentTo);
        setStep('otp');
      })
      .catch(() => {
        /* sendState.error drives the UI */
      });
  };

  const submitMobile = (values: MobileFormValues): void => {
    const parsed = mobileSchema.safeParse(values);
    if (!parsed.success) {
      const next: LoginFieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof MobileFormValues | undefined;
        if (key && !next[key]) next[key] = issue.message;
      }
      setMobileFieldErrors(next);
      return;
    }
    setMobileFieldErrors({});
    setMobile(parsed.data.mobile);
    requestOtp(parsed.data);
  };

  const verifyCode = (code: string): void => {
    setOtpError(undefined);
    const parsed = otpSchema.safeParse({ code });
    if (!parsed.success) {
      setOtpError(parsed.error.issues[0]?.message ?? 'Invalid code');
      return;
    }
    verifyOtp({ requestId, code: parsed.data.code })
      .unwrap()
      .then((data) => {
        // Auth session now lives in the Redux authSlice.
        signIn(
          {
            id: data.user?.id ?? '',
            email: data.user?.email ?? '',
            name: data.user?.name ?? '',
          },
          data.token,
        );
        navigate('/home');
      })
      .catch((e) => {
        setOtpError((e as NormalizedApiError)?.message ?? 'Verification failed');
      });
  };

  const resend = (): void => {
    if (mobile) requestOtp({ mobile });
  };
  const changeNumber = (): void => {
    setStep('mobile');
    setOtpError(undefined);
  };

  return {
    step,
    sentTo,
    submitMobile,
    mobileFieldErrors,
    isSending: sendState.isLoading,
    sendError: (sendState.error as NormalizedApiError | undefined) ?? null,
    verifyCode,
    otpError,
    isVerifying: verifyState.isLoading,
    resend,
    changeNumber,
  };
}
