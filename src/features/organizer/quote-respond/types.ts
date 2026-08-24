export type { ApiIncomingRequest, ApiQuotation } from '@features/organizer/quotes/types';

export interface LineItemSubItemForm {
  label: string;
  value: string;
}

/** Editable form model for one quotation line item — price kept as a string
 * while editing (controlled input), parsed to a number only on submit. */
export interface LineItemForm {
  key: string;
  title: string;
  subtitle: string;
  price: string;
  note: string;
  subItems: LineItemSubItemForm[];
}

/** Matches the backend's RespondQuotationDto/UpdateQuotationDto body shape. */
export interface RespondQuotationBody {
  lineItems: Array<{
    key?: string | undefined;
    title: string;
    subtitle?: string | undefined;
    price: number;
    note?: string | undefined;
    subItems?: Array<{ label: string; value: string }> | undefined;
  }>;
  taxRate?: number | undefined;
  notes?: string | undefined;
  advancePercentage?: number | undefined;
  siteVisitSuggested?: boolean | undefined;
  /** `true` parks the quote as a private draft; `false` sends it. */
  asDraft?: boolean | undefined;
}

/**
 * The design groups the builder by service category, giving each one its own
 * detail fields (plates/rate for catering, coverage hours for photography …).
 * Those details persist as the line item's `subItems`, so no new API surface is
 * needed — this map is only what the UI renders per category.
 */
export interface CategoryFieldSpec {
  /** `subItems[].label` this field reads and writes. */
  label: string;
  placeholder: string;
  /** Numeric fields feed the auto-computed price where `derivePrice` applies. */
  numeric?: boolean;
}

export interface CategorySpec {
  /** Stable `key` written to the line item. */
  key: string;
  /** Matcher against the customer's requested category string. */
  match: string[];
  icon: 'utensils' | 'flower' | 'camera' | 'flame' | 'music' | 'car' | 'gift' | 'sparkles';
  fields: CategoryFieldSpec[];
  /** Multi-select add-ons, stored as one comma-joined `subItem`. */
  options?: { label: string; values: string[] } | undefined;
  /** Free-text detail line, stored as the line item's `note`. */
  noteLabel?: string | undefined;
  /** When set, price = product of these two field labels. */
  derivePrice?: [string, string] | undefined;
}
