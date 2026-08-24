import { useMemo, useState } from 'react';
import {
  useGetOrganizerCalendarQuery,
  useSetDateBlockedMutation,
} from '@features/organizer/bookings/service';
import { MAX_RANGE_DAYS } from '../constants';
import type { CalendarDay, CalendarView } from '../types';

// Bookings are stored/keyed by their UTC-midnight calendar day (see backend
// `deriveEventDate`). The grid is built entirely in UTC too, so "the 20th"
// means the same instant everywhere regardless of the viewer's own timezone
// — building it with local Date getters would shift every day by the
// viewer's UTC offset (e.g. IST/+5:30 makes local-Dec-20 read as UTC-Dec-19).
function toIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function buildMonth(viewMonth: Date, bookedByIso: Map<string, unknown>, blockedIsos: Set<string>): CalendarDay[] {
  const year = viewMonth.getUTCFullYear();
  const month = viewMonth.getUTCMonth();
  const firstOfMonth = new Date(Date.UTC(year, month, 1));
  const startOffset = firstOfMonth.getUTCDay(); // 0 = Sunday
  const gridStartMs = Date.UTC(year, month, 1 - startOffset);
  const todayIso = toIso(new Date());

  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(gridStartMs + i * 24 * 60 * 60 * 1000);
    const iso = toIso(date);
    const inMonth = date.getUTCMonth() === month;
    const booking = bookedByIso.get(iso) as CalendarDay['booking'];

    let status: CalendarDay['status'] = 'available';
    if (!inMonth) status = 'outside';
    else if (booking) status = 'booked';
    else if (blockedIsos.has(iso)) status = 'blocked';
    else if (iso < todayIso) status = 'past';

    return { date, iso, inMonth, status, booking };
  });
}

/** YYYYMMDD, the all-day-event date format iCal expects. */
function icsDate(iso: string): string {
  return iso.replace(/-/g, '');
}

/** Escapes text per RFC 5545 (comma/semicolon/backslash/newline). */
function icsEscape(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n');
}

export function useCalendar() {
  const { data, isLoading, isError, refetch } = useGetOrganizerCalendarQuery();
  const [setBlocked, blockState] = useSetDateBlockedMutation();
  const [viewMonth, setViewMonth] = useState(() => {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  });
  const [selectedIso, setSelectedIso] = useState<string | null>(null);
  const [view, setView] = useState<CalendarView>('Month');
  const [rangeError, setRangeError] = useState<string | null>(null);
  const [isBlockingRange, setIsBlockingRange] = useState(false);

  const bookedByIso = useMemo(() => {
    const map = new Map<string, unknown>();
    (data?.bookedDates ?? []).forEach((b) => map.set(b.date.slice(0, 10), b));
    return map;
  }, [data]);

  const blockedIsos = useMemo(
    () => new Set((data?.blockedDates ?? []).map((d) => d.slice(0, 10))),
    [data],
  );

  const days = useMemo(
    () => buildMonth(viewMonth, bookedByIso, blockedIsos),
    [viewMonth, bookedByIso, blockedIsos],
  );

  const selectedDay = days.find((d) => d.iso === selectedIso) ?? null;

  /**
   * Week view is the same 42-cell grid narrowed to one row — the week holding
   * the selected day, or today's week when nothing is selected. Deriving it
   * from `days` keeps booked/blocked/past classification identical.
   */
  const visibleDays = useMemo(() => {
    if (view === 'Month') return days;
    const anchor = selectedIso ?? toIso(new Date());
    const index = days.findIndex((d) => d.iso === anchor);
    const start = index >= 0 ? Math.floor(index / 7) * 7 : 0;
    return days.slice(start, start + 7);
  }, [view, days, selectedIso]);

  /**
   * Block or unblock every day in an inclusive range. The API is per-date, so
   * this fans out sequentially — sequential rather than parallel so a large
   * range can't flood the server, and so a mid-way failure leaves a coherent
   * partial state the next refetch will reflect.
   */
  const blockRange = async (fromIso: string, toIsoStr: string, blocked = true) => {
    setRangeError(null);
    if (!fromIso || !toIsoStr) return false;
    if (toIsoStr < fromIso) {
      setRangeError('The end date must be on or after the start date.');
      return false;
    }
    const startMs = Date.parse(`${fromIso}T00:00:00Z`);
    const endMs = Date.parse(`${toIsoStr}T00:00:00Z`);
    if (Number.isNaN(startMs) || Number.isNaN(endMs)) return false;
    const dayCount = Math.round((endMs - startMs) / 86_400_000) + 1;
    if (dayCount > MAX_RANGE_DAYS) {
      setRangeError(`Pick a range of ${MAX_RANGE_DAYS} days or fewer.`);
      return false;
    }

    setIsBlockingRange(true);
    try {
      for (let i = 0; i < dayCount; i += 1) {
        const iso = toIso(new Date(startMs + i * 86_400_000));
        // Never blocks over a real booking.
        if (bookedByIso.has(iso)) continue;
        await setBlocked({ date: iso, blocked }).unwrap();
      }
      return true;
    } catch {
      setRangeError('Could not block the whole range. Please try again.');
      return false;
    } finally {
      setIsBlockingRange(false);
    }
  };

  const goToPrevMonth = () =>
    setViewMonth((m) => new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth() - 1, 1)));
  const goToNextMonth = () =>
    setViewMonth((m) => new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth() + 1, 1)));

  const toggleBlocked = (iso: string, blocked: boolean) => {
    void setBlocked({ date: iso, blocked });
  };

  /** All confirmed bookings as one downloadable .ics file (client-side only). */
  const exportIcal = () => {
    const bookings = data?.bookedDates ?? [];
    if (bookings.length === 0) return;

    const stamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const events = bookings.map((b) => {
      const startIso = b.date.slice(0, 10);
      const end = new Date(startIso);
      end.setUTCDate(end.getUTCDate() + 1);
      return [
        'BEGIN:VEVENT',
        `UID:${b.bookingId}@evently.app`,
        `DTSTAMP:${stamp}`,
        `DTSTART;VALUE=DATE:${icsDate(startIso)}`,
        `DTEND;VALUE=DATE:${icsDate(toIso(end))}`,
        `SUMMARY:${icsEscape(b.title || 'Event')}`,
        `DESCRIPTION:${icsEscape(`Customer: ${b.customerName || '—'} · Value: ₹${b.amount.toLocaleString('en-IN')}`)}`,
        `STATUS:${b.status === 'confirmed' ? 'CONFIRMED' : 'TENTATIVE'}`,
        'END:VEVENT',
      ].join('\r\n');
    });

    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Evently//Organizer Calendar//EN',
      'CALSCALE:GREGORIAN',
      ...events,
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'evently-bookings.ics';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return {
    viewMonth,
    days,
    visibleDays,
    view,
    setView,
    blockRange,
    isBlockingRange,
    rangeError,
    isLoading,
    isError,
    refetch,
    goToPrevMonth,
    goToNextMonth,
    selectedIso,
    setSelectedIso,
    selectedDay,
    toggleBlocked,
    isToggling: blockState.isLoading,
    exportIcal,
    canExport: (data?.bookedDates.length ?? 0) > 0,
  };
}
