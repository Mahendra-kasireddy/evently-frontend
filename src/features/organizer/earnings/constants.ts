import type { StatusTone } from '@shared/partner';
import type { EarningsPeriod } from './types';
import type { PayoutStatus } from '@features/organizer/bookings/types';

export const EARNINGS_COPY = {
  download: 'Download statement',
  downloadEmpty: 'No transactions in this period to export',
  totalEarned: 'Total earned',
  commission: 'Commission',
  netPayout: 'Net payout',
  pendingPayout: 'Pending payout',
  monthly: 'Monthly earnings',
  mix: 'Event mix',
  mixEmpty: 'No bookings yet.',
  monthlyEmpty: 'No earnings recorded yet.',
  emptyTitle: 'Nothing in this period',
  emptyBody: 'Switch period to see earlier bookings.',
  emptyAllTitle: 'No earnings yet',
  emptyAllBody: 'Confirmed bookings and their payouts will appear here.',
  rangeFrom: 'From',
  rangeTo: 'To',
  columns: {
    ref: 'Booking ID',
    customer: 'Customer',
    date: 'Date',
    amount: 'Amount',
    commission: 'Commission',
    net: 'Net',
    payout: 'Payout',
  },
} as const;

export const EARNINGS_PERIODS: readonly EarningsPeriod[] = ['This month', 'Last 3 months', 'Custom'];

export const PAYOUT_LABEL: Record<PayoutStatus, string> = {
  paid: 'Paid',
  pending: 'Pending',
};

export const PAYOUT_TONE: Record<PayoutStatus, StatusTone> = {
  paid: 'green',
  pending: 'amber',
};

/** Bar colours: the trailing (current) month is highlighted, per the design. */
export const BAR_IDLE = 'var(--c-navy-wash)';
export const BAR_ACTIVE = 'var(--c-coral)';

/** Donut slice palette, in the design's order. */
export const MIX_COLORS = [
  'var(--c-coral)',
  'var(--c-teal)',
  'var(--c-navy)',
  'var(--c-amber)',
  '#7C5BD6',
  '#2B8FD9',
];

/** `148000` → `₹1.5L`, the compact label the design puts above the tall bar. */
export function shortAmount(value: number): string {
  if (value >= 1_00_00_000) return `₹${(value / 1_00_00_000).toFixed(1).replace(/\.0$/, '')}Cr`;
  if (value >= 1_00_000) return `₹${(value / 1_00_000).toFixed(1).replace(/\.0$/, '')}L`;
  if (value >= 1_000) return `₹${Math.round(value / 1_000)}K`;
  return `₹${value}`;
}
