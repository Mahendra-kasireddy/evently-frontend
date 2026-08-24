// ---- View models consumed by the section components (UI shape, unchanged) ----
export type QuoteTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
export interface QuoteCard { id: string; initials: string; name: string; avatarColor: string; tier: QuoteTier; received: string; grandTotal: string; status: string }
export interface CompColumn { id: string; label: string }
export interface CompRow {
  label: string;
  values: Record<string, string>;
  /** Raw amounts behind `values`, for per-row "best" resolution. Absent = not quoted. */
  amounts: Record<string, number>;
  summary?: boolean;
  /** True for the grand-total row, which the accept action keys off. */
  total?: boolean;
}
export interface QuotesData {
  eyebrow: string;
  heading: string;
  subtitle: string;
  quotes: QuoteCard[];
  columns: CompColumn[];
  rows: CompRow[];
  bestId: string;
  anomaly: string;
}

// ---- API shapes (MongoDB-backed, returned by the backend quote module) ----
export type QuotationStatus = 'draft' | 'sent' | 'updated' | 'accepted' | 'rejected' | 'withdrawn';
export type QuoteRequestStatus = 'open' | 'quoted' | 'accepted' | 'cancelled' | 'closed';

export interface ApiOrganizer {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  tier: string;
  rating: number;
  reviews: number;
}
export interface ApiLineSubItem { label: string; value: string }
export interface ApiLine {
  key: string;
  title: string;
  subtitle: string;
  price: number;
  note?: string;
  subItems: ApiLineSubItem[];
}
export interface ApiQuotation {
  id: string;
  requestId: string;
  status: QuotationStatus;
  lineItems: ApiLine[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  grandTotal: number;
  /** Share of the grand total payable up front to confirm the booking. */
  advancePercentage: number;
  /** Computed by the API from grandTotal x advancePercentage — never client-side. */
  advanceAmount: number;
  /** Organizer flagged this event as warranting an on-site visit first. */
  siteVisitSuggested: boolean;
  notes: string;
  organizer: ApiOrganizer | null;
  createdAt?: string;
  updatedAt?: string;
}
export interface ApiTimelineEvent { key: string; label: string; at?: string }
export interface ApiQuoteRequestDetail {
  id: string;
  occasion: string;
  when: string;
  where: string;
  guests: string;
  status: QuoteRequestStatus;
  createdAt?: string;
  quotations: ApiQuotation[];
  timeline: ApiTimelineEvent[];
}
export interface ApiQuoteRequestSummary {
  id: string;
  occasion: string;
  when: string;
  where: string;
  guests: string;
  status: QuoteRequestStatus;
  createdAt?: string;
  organizer: ApiOrganizer | null;
  /** Live quotations on this request — drafts and withdrawn ones excluded. */
  quotationCount: number;
  /** When the most recent of those arrived; null when there are none. */
  lastQuotedAt: string | null;
}
