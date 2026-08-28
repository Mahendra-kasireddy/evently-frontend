export interface SubVendorProfile {
  id: string;
  fullName: string;
  initials: string;
  avatarColor: string;
  category: string;
  /** The vendor's own words, when `category` is 'other'. */
  customCategory: string;
  serviceArea: string;
  baseRate: number;
  baseRateUnit: string;
  minOrder: number;
  /** Whether they're currently taking work. Organizers' pickers respect it. */
  active: boolean;
}

/** The subset a vendor may change about themselves. */
export interface ProfileEdits {
  serviceArea: string;
  baseRate: string;
  minOrder: string;
}

export type ProfileFieldErrors = Partial<Record<keyof ProfileEdits, string>>;
