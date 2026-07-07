import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Mail } from 'lucide-react';
import { Button } from '@shared/reusable';
import { FORM } from '../../constants';
import type { LoginFieldErrors, MobileFormValues } from '../../types';
import styles from './LoginForm.module.css';

export interface LoginFormProps {
  onSubmit: (values: MobileFormValues) => void;
  isPending: boolean;
  fieldErrors: LoginFieldErrors;
  formError?: string;
  sentTo?: string;
}

/** Right form panel: mobile OTP + email fallback. Pure UI. */
export function LoginForm({ onSubmit, isPending, fieldErrors, formError, sentTo }: LoginFormProps) {
  const [mobile, setMobile] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    onSubmit({ mobile: mobile.replace(/\s/g, '') });
  };

  return (
    <div className={styles.panel}>
      <h1 className={styles.title}>{FORM.title}</h1>
      <p className={styles.subtitle}>{FORM.subtitle}</p>

      <form onSubmit={handleSubmit} noValidate>
        <label className={styles.label} htmlFor="login-mobile">{FORM.mobileLabel}</label>
        <div className={`${styles.inputWrap} ${fieldErrors.mobile ? styles.inputError : ''}`}>
          <span className={styles.dial}>{FORM.dialCode}</span>
          <input
            id="login-mobile" inputMode="numeric" autoComplete="tel"
            className={styles.input} placeholder={FORM.placeholder}
            value={mobile} onChange={(e) => setMobile(e.target.value)}
            aria-invalid={fieldErrors.mobile ? true : undefined}
          />
        </div>
        {fieldErrors.mobile && <p className={styles.err} role="alert">{fieldErrors.mobile}</p>}
        {formError && <p className={styles.err} role="alert">{formError}</p>}
        {sentTo && <p className={styles.ok} role="status">Code sent to {sentTo}</p>}

        <Button type="submit" variant="brand" size="lg" isLoading={isPending} className={styles.full}>
          <MessageSquare size={18} /> {FORM.sendCta}
        </Button>
      </form>

      <div className={styles.or}><span>or</span></div>

      <Button type="button" variant="secondary" size="lg" className={styles.full}>
        <Mail size={18} /> {FORM.emailCta}
      </Button>

      <div className={styles.divider} />

      <div className={styles.roles}>
        <Link to="/onboarding/organizer">Log in as Organizer</Link>
        <span className={styles.dot}>·</span>
        <Link to="/onboarding/subvendor">Join as Sub-vendor</Link>
      </div>

      <p className={styles.terms}>
        By continuing you agree to Evently&apos;s <strong>Terms</strong> &amp; <strong>Privacy Policy</strong>.
      </p>
    </div>
  );
}
