export type QuoteTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
export interface QuoteCard { id: string; initials: string; name: string; avatarColor: string; tier: QuoteTier; received: string; grandTotal: string; status: string }
export interface CompColumn { id: string; label: string }
export interface CompRow { label: string; values: Record<string, string>; summary?: boolean }
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
