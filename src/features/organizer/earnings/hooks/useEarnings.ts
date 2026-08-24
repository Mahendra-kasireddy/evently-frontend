import { useMemo, useState } from 'react';
import { useGetOrganizerEarningsQuery } from '@features/organizer/bookings/service';
import type { EarningsPeriod, EarningsTotals, EarningsTransaction } from '../types';

/** UTC day key, matching how booking dates are stored. */
function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Inclusive [from, to] day bounds for a period, or null for "everything". */
function boundsFor(
  period: EarningsPeriod,
  customFrom: string,
  customTo: string,
): [string, string] | null {
  const now = new Date();
  if (period === 'This month') {
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));
    return [isoDay(start), isoDay(end)];
  }
  if (period === 'Last 3 months') {
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 2, 1));
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));
    return [isoDay(start), isoDay(end)];
  }
  if (customFrom && customTo) {
    return customFrom <= customTo ? [customFrom, customTo] : [customTo, customFrom];
  }
  return null;
}

/** CSV cell escaping — quotes doubled, field wrapped when it holds a delimiter. */
function csvCell(value: string | number): string {
  const s = String(value ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function useEarnings() {
  const { data, isLoading, isError, refetch } = useGetOrganizerEarningsQuery();
  const [period, setPeriod] = useState<EarningsPeriod>('This month');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const allTransactions = useMemo<EarningsTransaction[]>(() => data?.transactions ?? [], [data]);

  const transactions = useMemo(() => {
    const bounds = boundsFor(period, customFrom, customTo);
    if (!bounds) return allTransactions;
    const [from, to] = bounds;
    return allTransactions.filter((t) => {
      const day = (t.eventDate ?? '').slice(0, 10);
      return day >= from && day <= to;
    });
  }, [allTransactions, period, customFrom, customTo]);

  /**
   * Tiles are recomputed from whichever transactions are on screen, so the
   * headline figures always tie to the ledger beneath them. Over the full set
   * these reproduce the API's own aggregate (bar a rupee of rounding — the API
   * rounds commission once on the total, this sums it per booking).
   */
  const totals = useMemo<EarningsTotals>(() => {
    const totalEarned = transactions.reduce((s, t) => s + t.amount, 0);
    const commission = transactions.reduce((s, t) => s + t.commission, 0);
    const netPayout = transactions.reduce((s, t) => s + t.net, 0);
    const pendingPayout = transactions
      .filter((t) => t.payoutStatus !== 'paid')
      .reduce((s, t) => s + t.net, 0);
    return { totalEarned, commission, netPayout, pendingPayout };
  }, [transactions]);

  /** Change against the equivalent immediately-preceding window. */
  const changePercent = useMemo<number | null>(() => {
    if (period === 'Custom') return null;
    const now = new Date();
    const span = period === 'This month' ? 1 : 3;
    const prevStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - span * 2 + 1, 1));
    const prevEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - span + 1, 0));
    const from = isoDay(prevStart);
    const to = isoDay(prevEnd);
    const previous = allTransactions
      .filter((t) => {
        const day = (t.eventDate ?? '').slice(0, 10);
        return day >= from && day <= to;
      })
      .reduce((s, t) => s + t.amount, 0);
    if (previous === 0) return null;
    return Math.round(((totals.totalEarned - previous) / previous) * 100);
  }, [allTransactions, period, totals.totalEarned]);

  /** The visible ledger as a CSV file — the design's "Download statement". */
  const downloadStatement = () => {
    if (transactions.length === 0) return;
    const header = ['Booking ID', 'Customer', 'Event date', 'Amount', 'Commission', 'Net', 'Payout'];
    const rows = transactions.map((t) => [
      t.ref,
      t.customerName || '',
      (t.eventDate ?? '').slice(0, 10),
      t.amount,
      t.commission,
      t.net,
      t.payoutStatus,
    ]);
    const csv = [header, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n');
    // BOM so Excel opens the ₹-adjacent columns in UTF-8.
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evently-earnings-${isoDay(new Date())}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return {
    earnings: data,
    isLoading,
    isError,
    refetch,
    period,
    setPeriod,
    customFrom,
    setCustomFrom,
    customTo,
    setCustomTo,
    transactions,
    totals,
    changePercent,
    downloadStatement,
    canDownload: transactions.length > 0,
    hasAny: allTransactions.length > 0,
  };
}
