export interface SubvendorDraft {
  fullName: string;
  categoryId: string;
  serviceArea: string;
  baseRate: string;
  minOrder: string;
  organizerPhone: string;
}

export type SubvendorFieldErrors = Partial<Record<keyof SubvendorDraft, string>>;
