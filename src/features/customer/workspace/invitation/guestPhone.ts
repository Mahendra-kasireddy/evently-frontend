/**
 * Guest phone normalisation — a deliberate mirror of the backend's
 * `modules/invitation/guest/guest-phone.ts`.
 *
 * Duplicated rather than shared because the two repos have no common package.
 * The server remains authoritative: it re-parses every number it is sent, so a
 * client that drifted from this could never smuggle a bad number past it. This
 * copy exists only so the customer sees "that is not a mobile number" while
 * typing rather than after a round trip.
 *
 * Keep the two in step. If they ever disagree, the server is right.
 */

export type PhoneRejection =
  | 'empty'
  | 'not_a_number'
  | 'too_short'
  | 'too_long'
  | 'invalid_mobile'
  | 'needs_country_code';

export interface PhoneParse {
  ok: boolean;
  /** `+919505043404` when ok. */
  e164: string;
  reason?: PhoneRejection;
}

/** E.164 caps the whole number, dial code included, at 15 digits. */
const E164_MAX = 15;
/** Shortest plausible international subscriber number. */
const E164_MIN = 8;

const fail = (reason: PhoneRejection): PhoneParse => ({ ok: false, e164: '', reason });

/**
 * Parses a number the customer typed.
 *
 * A national-format number is only accepted when the default dial code is one
 * whose national format this understands — today that is India's ten-digit
 * mobile range. For any other country the customer has to type the `+` form,
 * which is honest: guessing at national numbering plans without a full
 * numbering database produces confident wrong answers.
 */
export function parseGuestPhone(raw: string, defaultDialCode = '+91'): PhoneParse {
  const trimmed = (raw ?? '').trim();
  if (!trimmed) return fail('empty');

  // Separators people actually type. Everything else makes it not a number.
  const cleaned = trimmed.replace(/[\s\-().]/g, '');
  const international = cleaned.startsWith('+')
    ? cleaned.slice(1)
    : cleaned.startsWith('00')
      ? cleaned.slice(2)
      : '';

  if (international) {
    if (!/^\d+$/.test(international)) return fail('not_a_number');
    if (international.length < E164_MIN) return fail('too_short');
    if (international.length > E164_MAX) return fail('too_long');
    return { ok: true, e164: `+${international}` };
  }

  if (!/^\d+$/.test(cleaned)) return fail('not_a_number');

  const dial = defaultDialCode.replace(/^\+/, '');

  // Already carries the dial code without a plus, e.g. 919505043404.
  if (cleaned.length > 10 && cleaned.startsWith(dial)) {
    if (cleaned.length > E164_MAX) return fail('too_long');
    return { ok: true, e164: `+${cleaned}` };
  }

  if (dial !== '91') return fail('needs_country_code');

  if (cleaned.length < 10) return fail('too_short');
  if (cleaned.length > 10) return fail('too_long');
  // Indian mobile numbers begin 6–9; landlines cannot receive WhatsApp.
  if (!/^[6-9]/.test(cleaned)) return fail('invalid_mobile');
  return { ok: true, e164: `+91${cleaned}` };
}

/** `+919505043404` → `+91 95050 43404`, for showing the customer what they typed. */
export function displayPhone(e164: string): string {
  const match = /^\+(91)(\d{5})(\d{5})$/.exec(e164);
  if (match) return `+${match[1]} ${match[2]} ${match[3]}`;
  return e164;
}

/** What `wa.me` wants: the E.164 digits with no plus and no separators. */
export function waDigits(e164: string): string {
  return e164.replace(/\D/g, '');
}

/** Human-readable reasons, so the client is not left inventing its own copy. */
export const PHONE_REJECTION_MESSAGE: Record<PhoneRejection, string> = {
  empty: 'Enter a WhatsApp number.',
  not_a_number: 'That does not look like a phone number.',
  too_short: 'That number is too short.',
  too_long: 'That number is too long.',
  invalid_mobile: 'Indian mobile numbers start with 6, 7, 8 or 9.',
  needs_country_code: 'Include the country code, for example +44…',
};
