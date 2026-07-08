export type QdTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
export type LineIcon = 'food' | 'water' | 'decor' | 'photo' | 'music' | 'other';
export interface LineSubItem { label: string; value: string }
export interface LineItem { id: string; icon: LineIcon; title: string; subtitle: string; price: string; subItems: LineSubItem[]; note?: string }
export interface QuoteDetail {
  id: string;
  initials: string;
  name: string;
  avatarColor: string;
  tier: QdTier;
  rating: number;
  reviews: number;
  receivedLabel: string;
  status: string;
  items: LineItem[];
  subtotal: string;
  gst: string;
  gstLabel: string;
  grandTotal: string;
  grandNote: string;
  advanceLabel: string;
  advance: string;
  balanceLabel: string;
  balance: string;
  footnote: string;
}
