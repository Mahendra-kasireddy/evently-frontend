export type { CalendarBookedDate, OrganizerCalendar } from '@features/organizer/bookings/types';

export type DayStatus = 'booked' | 'blocked' | 'available' | 'past' | 'outside';

export interface CalendarDay {
  date: Date;
  iso: string;
  inMonth: boolean;
  status: DayStatus;
  booking: import('@features/organizer/bookings/types').CalendarBookedDate | undefined;
}

/** Month grid, or just the week containing the focused day. */
export type CalendarView = 'Month' | 'Week';
