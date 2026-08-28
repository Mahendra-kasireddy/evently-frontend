/** `GET /user/getUserDetails` — the account behind the sub-vendor profile. */
export interface AccountDetails {
  id: string;
  name: string;
  email?: string;
  /** 10 digits, no dial code. The OTP login identity — not editable here. */
  phone?: string;
  city: string;
  roles: string[];
}

/** The subset of the account a sub-vendor may change about themselves. */
export interface AccountEdits {
  name: string;
  email: string;
  city: string;
}

export type AccountFieldErrors = Partial<Record<keyof AccountEdits, string>>;
