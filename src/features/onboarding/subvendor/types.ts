export interface SubvendorDraft {
  fullName: string;
  categoryId: string;
  /** The vendor's own words, used only when `categoryId` is 'other'. */
  customCategory: string;
  serviceArea: string;
  baseRate: string;
  minOrder: string;
  organizerPhone: string;
}

export type SubvendorFieldErrors = Partial<Record<keyof SubvendorDraft, string>>;
