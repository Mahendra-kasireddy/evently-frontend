import { z } from 'zod';

/**
 * Subject keys mirror the backend's `ContactSubject` enum exactly — the form
 * can only offer categories the domain model actually has.
 */
export const CONTACT_SUBJECTS = [
  'general',
  'event_planning',
  'organizer',
  'booking',
  'billing',
  'technical',
  'other',
] as const;

export type ContactSubject = (typeof CONTACT_SUBJECTS)[number];

export const SUBJECT_LABEL: Record<ContactSubject, string> = {
  general: 'General enquiry',
  event_planning: 'Event planning',
  organizer: 'Organizer',
  booking: 'Booking',
  billing: 'Payment / Billing',
  technical: 'Technical issue',
  other: 'Other',
};

/**
 * Client-side validation. Every rule matches the server DTO, so the form never
 * accepts something the API will reject — but the server is what enforces it.
 * The mobile rule is Evently's existing one (10 digits, +91), the same shape
 * the OTP login uses, so a customer is not asked for their number twice in two
 * different formats.
 */
export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Please enter your name')
    .max(80, 'That name is too long'),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Enter a valid email address')
    .max(160, 'That email is too long'),
  phone: z
    .string()
    .trim()
    .min(1, 'Mobile number is required')
    .regex(/^\d{10}$/, 'Enter a valid 10-digit mobile number'),
  subject: z.enum(CONTACT_SUBJECTS, {
    errorMap: () => ({ message: 'Choose what your message is about' }),
  }),
  message: z
    .string()
    .trim()
    .min(10, 'Please tell us a little more — at least 10 characters')
    .max(5000, 'That message is too long'),
});

export type ContactFormValues = z.infer<typeof contactSchema>;
export type ContactFieldErrors = Partial<Record<keyof ContactFormValues, string>>;

/** What the API returns once the message is stored. */
export interface ContactReceipt {
  id: string;
  status: string;
  createdAt: string;
}

/** Name/email/phone already on file for a signed-in customer. */
export interface ContactPrefill {
  name: string;
  email: string;
  phone: string;
}
