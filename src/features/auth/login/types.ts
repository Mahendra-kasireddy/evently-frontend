import { z } from 'zod';

/** Mobile-number (OTP) login form. */
export const mobileSchema = z.object({
  mobile: z
    .string()
    .min(1, 'Mobile number is required')
    .regex(/^\d{10}$/, 'Enter a valid 10-digit mobile number'),
});
export type MobileFormValues = z.infer<typeof mobileSchema>;

/** Server response for an OTP request (validated at the boundary). */
export const otpResponseSchema = z.object({
  requestId: z.string(),
  sentTo: z.string(),
});
export type OtpResponse = z.infer<typeof otpResponseSchema>;

export type LoginFieldErrors = Partial<Record<keyof MobileFormValues, string>>;

export const otpSchema = z.object({
  code: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code'),
});
export type OtpFormValues = z.infer<typeof otpSchema>;
