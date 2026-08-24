import { useCallback, useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { ArrowLeft, ShieldCheck, X } from 'lucide-react';
import { Button } from '@shared/reusable';
import { useAuth, type Role } from '@app/auth';
import { type NormalizedApiError } from '@lib/api';
import { useSendOtpMutation, useVerifyOtpMutation } from '@features/auth/login/service';
import { AUTH_MODAL_COPY as COPY, OTP_LENGTH, RESEND_SECONDS } from './constants';
import styles from './AuthModal.module.css';

export interface AuthModalProps {
  open: boolean;
  /** Closed without signing in (Escape, backdrop, ✕). */
  onClose: () => void;
  /** Signed in successfully — the caller resumes whatever it was doing. */
  onSuccess: () => void;
  /** Why the sign-in is being asked for, e.g. "to submit your plan". */
  reason?: string;
  title?: string;
}

/**
 * Reusable mobile + OTP sign-in dialog for actions that need an account
 * mid-flow — submitting a plan, requesting a quote — so the customer is never
 * bounced to /login and never loses what they were doing. It reuses the same
 * auth mutations and session store as the login screen; there is no second auth
 * path here. Verifying a number that already exists signs into that same
 * account (the backend resolves users by phone), so nothing is duplicated.
 */
export function AuthModal({ open, onClose, onSuccess, reason, title }: AuthModalProps) {
  const id = useId();
  const { signIn } = useAuth();
  const [sendOtp, sendState] = useSendOtpMutation();
  const [verifyOtp, verifyState] = useVerifyOtpMutation();

  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [mobile, setMobile] = useState('');
  const [requestId, setRequestId] = useState('');
  const [sentTo, setSentTo] = useState('');
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState<string | undefined>();
  const [secs, setSecs] = useState(RESEND_SECONDS);

  const boxes = useRef<Array<HTMLInputElement | null>>([]);
  const mobileInput = useRef<HTMLInputElement | null>(null);
  const dialog = useRef<HTMLDivElement | null>(null);

  const reset = useCallback(() => {
    setStep('mobile');
    setMobile('');
    setRequestId('');
    setSentTo('');
    setDigits(Array(OTP_LENGTH).fill(''));
    setError(undefined);
    setSecs(RESEND_SECONDS);
  }, []);

  // Escape closes; focus moves into the dialog so keyboard users start inside.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    const first = mobileInput.current ?? dialog.current;
    first?.focus();
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || step !== 'otp' || secs <= 0) return;
    const t = setTimeout(() => setSecs((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [open, step, secs]);

  if (!open) return null;

  const send = (e: FormEvent) => {
    e.preventDefault();
    setError(undefined);
    const value = mobile.replace(/\D/g, '');
    if (value.length !== 10) {
      setError(COPY.badMobile);
      return;
    }
    sendOtp({ mobile: value })
      .unwrap()
      .then((d) => {
        setRequestId(d.requestId);
        setSentTo(d.sentTo ?? `+91 ${value}`);
        setStep('otp');
        setSecs(RESEND_SECONDS);
        setTimeout(() => boxes.current[0]?.focus(), 0);
      })
      .catch((err: NormalizedApiError) => setError(err?.message ?? COPY.sendFailed));
  };

  const verify = (e: FormEvent) => {
    e.preventDefault();
    setError(undefined);
    const code = digits.join('');
    if (code.length !== OTP_LENGTH) {
      setError(COPY.badCode);
      return;
    }
    verifyOtp({ requestId, code })
      .unwrap()
      .then((d) => {
        signIn(
          { id: d.user?.id ?? '', email: d.user?.email ?? '', name: d.user?.name ?? '' },
          d.token,
          (d.user?.roles as Role[] | undefined) ?? ['customer'],
        );
        reset();
        onSuccess();
      })
      .catch((err: NormalizedApiError) => {
        setDigits(Array(OTP_LENGTH).fill(''));
        boxes.current[0]?.focus();
        setError(err?.message ?? COPY.verifyFailed);
      });
  };

  const setDigit = (i: number, raw: string) => {
    const pasted = raw.replace(/\D/g, '');
    if (pasted.length > 1) {
      const next = Array(OTP_LENGTH).fill('');
      pasted.slice(0, OTP_LENGTH).split('').forEach((c, n) => { next[n] = c; });
      setDigits(next);
      boxes.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
      return;
    }
    const ch = pasted.slice(-1);
    setDigits((d) => {
      const next = [...d];
      next[i] = ch;
      return next;
    });
    if (ch && i < OTP_LENGTH - 1) boxes.current[i + 1]?.focus();
  };

  const onDigitKey = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) boxes.current[i - 1]?.focus();
  };

  const resend = () => {
    if (secs > 0) return;
    setDigits(Array(OTP_LENGTH).fill(''));
    setError(undefined);
    sendOtp({ mobile: mobile.replace(/\D/g, '') })
      .unwrap()
      .then((d) => {
        setRequestId(d.requestId);
        setSecs(RESEND_SECONDS);
      })
      .catch((err: NormalizedApiError) => setError(err?.message ?? COPY.sendFailed));
  };

  return (
    <div
      className={styles.backdrop}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        ref={dialog}
        tabIndex={-1}
      >
        <button type="button" className={styles.close} onClick={onClose} aria-label={COPY.close}>
          <X size={18} />
        </button>

        <span className={styles.badge}>
          <ShieldCheck size={22} />
        </span>
        <h2 className={styles.title} id={`${id}-title`}>
          {title ?? COPY.title}
        </h2>
        <p className={styles.sub}>
          {step === 'mobile' ? (reason ? `${COPY.reasonLead} ${reason}. ${COPY.subMobile}` : COPY.subMobile) : COPY.subOtp}
          {step === 'otp' && <strong className={styles.sentTo}> {sentTo}</strong>}
        </p>

        {step === 'mobile' ? (
          <form onSubmit={send} noValidate>
            <label className={styles.label} htmlFor={`${id}-mobile`}>
              {COPY.mobileLabel}
            </label>
            <div className={`${styles.inputWrap} ${error ? styles.inputError : ''}`}>
              <span className={styles.dial}>{COPY.dial}</span>
              <input
                id={`${id}-mobile`}
                ref={mobileInput}
                className={styles.input}
                inputMode="numeric"
                autoComplete="tel"
                placeholder={COPY.mobilePlaceholder}
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                aria-invalid={error ? true : undefined}
              />
            </div>
            {error && (
              <p className={styles.err} role="alert">
                {error}
              </p>
            )}
            <Button
              type="submit"
              variant="brand"
              className={styles.cta}
              isLoading={sendState.isLoading}
            >
              {COPY.sendCta}
            </Button>
          </form>
        ) : (
          <form onSubmit={verify} noValidate>
            <div className={styles.otp}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    boxes.current[i] = el;
                  }}
                  className={styles.box}
                  inputMode="numeric"
                  value={d}
                  onChange={(e) => setDigit(i, e.target.value)}
                  onKeyDown={(e) => onDigitKey(i, e)}
                  aria-label={`${COPY.digit} ${i + 1}`}
                />
              ))}
            </div>
            {error && (
              <p className={styles.err} role="alert">
                {error}
              </p>
            )}
            <Button
              type="submit"
              variant="brand"
              className={styles.cta}
              isLoading={verifyState.isLoading}
            >
              {COPY.verifyCta}
            </Button>
            <div className={styles.otpFoot}>
              <button type="button" className={styles.link} onClick={() => { setStep('mobile'); setError(undefined); }}>
                <ArrowLeft size={14} /> {COPY.changeNumber}
              </button>
              <button type="button" className={styles.link} onClick={resend} disabled={secs > 0}>
                {secs > 0 ? `${COPY.resendIn} ${secs}s` : COPY.resend}
              </button>
            </div>
          </form>
        )}

        <p className={styles.foot}>{COPY.foot}</p>
      </div>
    </div>
  );
}

export default AuthModal;
