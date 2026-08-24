export type {
  OrganizerEarnings,
  MonthlyEarning,
  EventMixSlice,
  EarningsTransaction,
  PayoutStatus,
} from '@features/organizer/bookings/types';

/** Period filter over the transaction ledger. */
export type EarningsPeriod = 'This month' | 'Last 3 months' | 'Custom';

/** Totals recomputed for whichever period is selected. */
export interface EarningsTotals {
  totalEarned: number;
  commission: number;
  netPayout: number;
  pendingPayout: number;
}
