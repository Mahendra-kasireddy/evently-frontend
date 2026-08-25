import {
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
} from 'react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { Button } from '@shared/reusable';
import styles from './OtpForm.module.css';

export interface OtpFormProps {
  sentTo: string;
  onVerify: (code: string) => void;
  onResend: () => void;
  onChangeNumber: () => void;
  isPending: boolean;
  error?: string;
}

const LENGTH = 6;

export function OtpForm({ sentTo, onVerify, onResend, onChangeNumber, isPending, error }: OtpFormProps) {
  const [digits, setDigits] = useState<string[]>(Array(LENGTH).fill(''));
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const [secs, setSecs] = useState(30);

  useEffect(() => {
    if (secs <= 0) return;
    const t = setTimeout(() => setSecs((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secs]);

  /*
   * A rejected code wipes the boxes and sends the caret back to the first one,
   * so the next attempt starts clean instead of the organizer having to
   * backspace six times. Adjusting during render rather than in an effect
   * keeps this out of a cascading-render cycle; the focus call itself lives in
   * the effect below, since focusing during render is not allowed.
   */
  const [lastError, setLastError] = useState(error);
  if (error !== lastError) {
    setLastError(error);
    if (error) setDigits(Array(LENGTH).fill(''));
  }

  useEffect(() => {
    if (error) refs.current[0]?.focus();
  }, [error]);

  const code = digits.join('');

  const setDigit = (i: number, val: string) => {
    const ch = val.replace(/\D/g, '').slice(-1);
    setDigits((d) => { const n = [...d]; n[i] = ch; return n; });
    if (ch && i < LENGTH - 1) refs.current[i + 1]?.focus();
  };
  const onKey = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  };
  const submit = (e: FormEvent<HTMLFormElement>) => { e.preventDefault(); onVerify(code); };
  const resend = () => {
    if (secs > 0) return;
    onResend();
    setSecs(30);
    setDigits(Array(LENGTH).fill(''));
    refs.current[0]?.focus();
  };

  /*
   * Pasting the whole code is how most people enter one they've copied from a
   * message. Without this, a six-digit paste lands entirely in whichever box
   * has focus and gets truncated to one character.
   */
  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, LENGTH);
    if (!pasted) return;
    e.preventDefault();
    const next = Array(LENGTH).fill('');
    pasted.split('').forEach((c, n) => {
      next[n] = c;
    });
    setDigits(next);
    refs.current[Math.min(pasted.length, LENGTH - 1)]?.focus();
  };

  return (
    <div className={styles.panel}>
      <button type="button" className={styles.back} onClick={onChangeNumber}>
        <ArrowLeft size={16} /> Change number
      </button>
      <h1 className={styles.title}>Verify your number</h1>
      <p className={styles.subtitle}>Enter the 6-digit code sent to <strong>{sentTo}</strong>.</p>

      <form onSubmit={submit}>
        <div className={styles.otp}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => { refs.current[i] = el; }}
              className={styles.box}
              inputMode="numeric"
              maxLength={1}
              value={d}
              // The code box is the only thing to do on this screen, so it takes
              // the caret on arrival — no click needed before typing.
              autoFocus={i === 0}
              autoComplete={i === 0 ? 'one-time-code' : 'off'}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={(e) => onKey(i, e)}
              onPaste={onPaste}
              aria-label={`Digit ${i + 1}`}
            />
          ))}
        </div>
        {error && <p className={styles.err} role="alert">{error}</p>}
        <Button type="submit" variant="brand" size="lg" isLoading={isPending} disabled={code.length < LENGTH} className={styles.full}>
          <ShieldCheck size={18} /> Verify &amp; continue
        </Button>
      </form>

      <p className={styles.resend}>
        {secs > 0
          ? <>Resend code in 0:{String(secs).padStart(2, '0')}</>
          : <button type="button" className={styles.resendBtn} onClick={resend}>Resend code</button>}
      </p>
    </div>
  );
}
