export const OTP_LENGTH = 6;
export const RESEND_SECONDS = 30;

export const AUTH_MODAL_COPY = {
  title: 'Verify your mobile',
  reasonLead: 'We just need to verify your number',
  subMobile: 'Enter your mobile number and we’ll text you a one-time code. No passwords, ever.',
  subOtp: 'Enter the 6-digit code sent to',
  mobileLabel: 'Mobile number',
  mobilePlaceholder: '98765 43210',
  dial: '+91',
  sendCta: 'Send code',
  verifyCta: 'Verify & continue',
  changeNumber: 'Change number',
  resend: 'Resend code',
  resendIn: 'Resend in',
  digit: 'Digit',
  close: 'Close',
  badMobile: 'Enter a valid 10-digit mobile number',
  badCode: 'Enter the 6-digit code',
  sendFailed: 'Could not send the code. Please try again.',
  verifyFailed: 'That code did not match. Please try again.',
  foot: 'Signing in with an existing number opens your existing account — nothing is duplicated.',
} as const;
