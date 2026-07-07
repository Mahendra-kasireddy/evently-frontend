import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
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
  const resend = () => { if (secs <= 0) { onResend(); setSecs(30); setDigits(Array(LENGTH).fill('')); } };

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
              inputMode="numeric" maxLength={1} value={d}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={(e) => onKey(i, e)}
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
