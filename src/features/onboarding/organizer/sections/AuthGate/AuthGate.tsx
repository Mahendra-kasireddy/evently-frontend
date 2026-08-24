import { useState, type FormEvent } from 'react';
import { MessageSquare, ShieldCheck } from 'lucide-react';
import { Input, Button } from '@shared/reusable';
import { useAuth, type Role } from '@app/auth';
import { type NormalizedApiError } from '@lib/api';
import { useSendOtpMutation, useVerifyOtpMutation } from '@features/auth/login/service';
import styles from './AuthGate.module.css';

/**
 * Inline OTP gate for organizer onboarding. Reuses the existing auth mutations
 * (no separate auth system) so an unauthenticated visitor can verify their
 * mobile in place and continue — instead of being bounced to /login. On success
 * it updates the auth session; the parent container then renders the onboarding.
 */
export function AuthGate() {
  const { signIn } = useAuth();
  const [sendOtp, sendState] = useSendOtpMutation();
  const [verifyOtp, verifyState] = useVerifyOtpMutation();

  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [mobile, setMobile] = useState('');
  const [requestId, setRequestId] = useState('');
  const [sentTo, setSentTo] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | undefined>();

  const send = (e: FormEvent) => {
    e.preventDefault();
    setError(undefined);
    const digits = mobile.replace(/\D/g, '');
    if (digits.length < 10) {
      setError('Enter a valid 10-digit mobile number');
      return;
    }
    sendOtp({ mobile: digits })
      .unwrap()
      .then((d) => {
        setRequestId(d.requestId);
        setSentTo(d.sentTo ?? digits);
        setStep('otp');
      })
      .catch((err: NormalizedApiError) => setError(err?.message ?? 'Could not send code'));
  };

  const verify = (e: FormEvent) => {
    e.preventDefault();
    setError(undefined);
    if (code.trim().length < 4) {
      setError('Enter the code you received');
      return;
    }
    verifyOtp({ requestId, code: code.trim() })
      .unwrap()
      .then((d) => {
        signIn(
          { id: d.user?.id ?? '', email: d.user?.email ?? '', name: d.user?.name ?? '' },
          d.token,
          (d.user?.roles as Role[] | undefined) ?? ['customer'],
        );
        // No navigation — the onboarding container re-renders once authenticated.
      })
      .catch((err: NormalizedApiError) => setError(err?.message ?? 'Verification failed'));
  };

  return (
    <div className={styles.card}>
      <span className={styles.badge}>
        <ShieldCheck size={22} />
      </span>
      <h2 className={styles.title}>Verify your mobile to continue</h2>
      <p className={styles.sub}>
        Organizer onboarding uses the same secure login. Verify your number to start.
      </p>

      {step === 'mobile' ? (
        <form onSubmit={send} className={styles.form} noValidate>
          <div className={styles.mobileRow}>
            <span className={styles.dial}>+91</span>
            <Input
              label="Mobile number"
              hideLabel
              inputMode="numeric"
              autoComplete="tel"
              placeholder="98765 43210"
              value={mobile}
              onChange={(ev) => setMobile(ev.target.value)}
              className={styles.grow}
            />
          </div>
          {error && (
            <p className={styles.err} role="alert">
              {error}
            </p>
          )}
          <Button type="submit" variant="brand" size="lg" isLoading={sendState.isLoading}>
            <MessageSquare size={18} /> Send code
          </Button>
        </form>
      ) : (
        <form onSubmit={verify} className={styles.form} noValidate>
          <p className={styles.sentTo} role="status">
            Code sent to {sentTo}
          </p>
          <Input
            label="Verification code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="6-digit code"
            value={code}
            onChange={(ev) => setCode(ev.target.value.replace(/\D/g, ''))}
          />
          {error && (
            <p className={styles.err} role="alert">
              {error}
            </p>
          )}
          <Button type="submit" variant="brand" size="lg" isLoading={verifyState.isLoading}>
            Verify &amp; continue
          </Button>
          <button type="button" className={styles.link} onClick={() => setStep('mobile')}>
            Change number
          </button>
        </form>
      )}
    </div>
  );
}
