export type PayIcon = 'upi' | 'card';
export interface PaymentMethod { id: string; label: string; icon: PayIcon }
export interface SummaryRow { label: string; value: string }
export interface BookingData {
  eyebrow: string;
  heading: string;
  subtitle: string;
  methods: PaymentMethod[];
  securedNote: string;
  cancellation: string;
  payNowLabel: string;
  payNow: string;
  balanceNote: string;
  summary: SummaryRow[];
  grandTotal: string;
  confirmLabel: string;
  footnote: string;
}
