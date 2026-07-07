import { LoginPromo, LoginForm, OtpForm } from './sections';
import { type UseLoginResult } from './hooks/useLogin';
import styles from './styles.module.css';

export interface LoginComponentProps {
  login: UseLoginResult;
}

/** Two-panel login card: promo (left) + the active step (right). Pure. */
export function Component({ login }: LoginComponentProps) {
  return (
    <div className={styles.card}>
      <LoginPromo />
      {login.step === 'mobile' ? (
        <LoginForm
          onSubmit={login.submitMobile}
          isPending={login.isSending}
          fieldErrors={login.mobileFieldErrors}
          {...(login.sendError ? { formError: login.sendError.message } : {})}
        />
      ) : (
        <OtpForm
          sentTo={login.sentTo ?? ''}
          onVerify={login.verifyCode}
          onResend={login.resend}
          onChangeNumber={login.changeNumber}
          isPending={login.isVerifying}
          {...(login.otpError ? { error: login.otpError } : {})}
        />
      )}
    </div>
  );
}
