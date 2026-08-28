import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowLeft, Check, MessageSquare, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth, type Role } from '@app/auth';
import { type NormalizedApiError } from '@lib/api';
import { useSendOtpMutation, useVerifyOtpMutation } from '@features/auth/login/service';
import styles from './OnboardingGate.module.css';

/** Everything that differs between the organizer and sub-vendor gates. */
export interface GateCopy {
  eyebrow: string;
  heading: string;
  blurb: string;
  /** Reasons to finish. Each must be true of the product today. */
  points: readonly string[];
  stepsTitle: string;
  /** The real wizard steps, so the preview can't promise a flow that doesn't exist. */
  steps: readonly string[];
  /** Shown under the steps — only when there is a real commitment to state. */
  note?: string | undefined;
  formSub: string;
}

const FIXED = {
  formTitle: 'Verify your mobile',
  sendCta: 'Send code',
  sending: 'Sending…',
  otpTitle: 'Enter your code',
  otpSub: 'We sent a 6-digit code to',
  verifyCta: 'Verify & continue',
  verifying: 'Verifying…',
  changeNumber: 'Use a different number',
  dial: '+91',
  placeholder: '98765 43210',
  terms: 'By continuing you agree to Evently’s Terms and Privacy Policy.',
} as const;

/**
 * The OTP gate both onboarding flows sit behind.
 *
 * Organizer and sub-vendor onboarding had two near-identical copies of this —
 * same markup, same bugs, drifting copy. One component, two copy objects.
 *
 * It reuses the existing OTP mutations rather than introducing a second auth
 * path, so an unauthenticated visitor verifies in place instead of being
 * bounced to /login; on success the session updates and the calling container
 * re-renders into its wizard.
 *
 * Laid out as a split — what they're signing up for beside the form — because
 * the screen it replaces was a 420px card at the top of a full-height page
 * that asked for a phone number without saying what onboarding involved. On
 * narrow viewports the form comes first, so nobody scrolls past the pitch to
 * reach the input they came for.
 */
export function OnboardingGate({ copy }: { copy: GateCopy }) {
  const { signIn } = useAuth();
  const [sendOtp, sendState] = useSendOtpMutation();
  const [verifyOtp, verifyState] = useVerifyOtpMutation();

  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [mobile, setMobile] = useState('');
  const [requestId, setRequestId] = useState('');
  const [sentTo, setSentTo] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | undefined>();

  const codeRef = useRef<HTMLInputElement>(null);

  /*
   * Move the cursor into the code field the moment it appears. Without it the
   * page swaps under the user's hands and leaves focus on a button that no
   * longer exists — they have to hunt for the input with the code already on
   * screen in their notifications. Focusing the DOM is what effects are for.
   */
  useEffect(() => {
    if (step === 'otp') codeRef.current?.focus();
  }, [step]);

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
        // No navigation — the container re-renders once authenticated.
      })
      .catch((err: NormalizedApiError) => setError(err?.message ?? 'Verification failed'));
  };

  return (
    <div className={styles.split}>
      {/* ------------------------------------------------------------- pitch */}
      <section className={styles.pitch}>
        <span className={styles.eyebrow}>{copy.eyebrow}</span>
        <h1 className={styles.heading}>{copy.heading}</h1>
        <p className={styles.blurb}>{copy.blurb}</p>

        <ul className={styles.points}>
          {copy.points.map((point) => (
            <li key={point} className={styles.point}>
              <span className={styles.tick}>
                <Check size={12} strokeWidth={3} />
              </span>
              {point}
            </li>
          ))}
        </ul>

        <div className={styles.steps}>
          <p className={styles.stepsTitle}>{copy.stepsTitle}</p>
          <ol className={styles.stepList}>
            {copy.steps.map((title, i) => (
              <li key={title} className={styles.step}>
                <span className={styles.stepNum}>{i + 1}</span>
                {title}
              </li>
            ))}
          </ol>
          {copy.note && (
            <p className={styles.sla}>
              <Sparkles size={14} /> {copy.note}
            </p>
          )}
        </div>
      </section>

      {/* -------------------------------------------------------------- form */}
      <section className={styles.card}>
        <span className={styles.badge}>
          <ShieldCheck size={20} />
        </span>

        {step === 'mobile' ? (
          <>
            <h2 className={styles.title}>{FIXED.formTitle}</h2>
            <p className={styles.sub}>{copy.formSub}</p>

            <form onSubmit={send} className={styles.form} noValidate>
              <label className={styles.label} htmlFor="gate-mobile">
                Mobile number
              </label>
              {/* One joined control, matching the Evently login screen — the
                  dial code and the field used to be two separate boxes. */}
              <div className={`${styles.phone} ${error ? styles.phoneBad : ''}`}>
                <span className={styles.dial}>{FIXED.dial}</span>
                <input
                  id="gate-mobile"
                  className={styles.phoneInput}
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  maxLength={10}
                  placeholder={FIXED.placeholder}
                  value={mobile}
                  onChange={(ev) => setMobile(ev.target.value.replace(/\D/g, ''))}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? 'gate-error' : undefined}
                />
              </div>

              {error && (
                <p id="gate-error" className={styles.err} role="alert">
                  {error}
                </p>
              )}

              <button type="submit" className={styles.cta} disabled={sendState.isLoading}>
                <MessageSquare size={17} />
                {sendState.isLoading ? FIXED.sending : FIXED.sendCta}
              </button>

              <p className={styles.terms}>{FIXED.terms}</p>
            </form>
          </>
        ) : (
          <>
            <h2 className={styles.title}>{FIXED.otpTitle}</h2>
            <p className={styles.sub}>
              {FIXED.otpSub} <strong className={styles.sentTo}>{sentTo}</strong>
            </p>

            <form onSubmit={verify} className={styles.form} noValidate>
              <label className={styles.label} htmlFor="gate-code">
                Verification code
              </label>
              <input
                id="gate-code"
                ref={codeRef}
                className={`${styles.codeInput} ${error ? styles.phoneBad : ''}`}
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="••••••"
                value={code}
                onChange={(ev) => setCode(ev.target.value.replace(/\D/g, ''))}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? 'gate-error' : undefined}
              />

              {error && (
                <p id="gate-error" className={styles.err} role="alert">
                  {error}
                </p>
              )}

              <button type="submit" className={styles.cta} disabled={verifyState.isLoading}>
                {verifyState.isLoading ? FIXED.verifying : FIXED.verifyCta}
              </button>

              <button
                type="button"
                className={styles.link}
                onClick={() => {
                  setStep('mobile');
                  setCode('');
                  setError(undefined);
                }}
              >
                <ArrowLeft size={14} /> {FIXED.changeNumber}
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
