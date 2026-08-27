import type { BookingStatus } from '@features/organizer/bookings/types';
import type { CalendarView } from './types';

export const CALENDAR_COPY = {
  month: 'Month',
  week: 'Week',
  blockRange: 'Block date range',
  exportIcal: 'Export iCal',
  exportEmpty: 'No confirmed bookings to export yet',
  exportReady: 'Download your confirmed bookings as a calendar file',
  viewEvent: 'View event',
  booked: 'Booked',
  blocked: 'Blocked',
  available: 'Available',
  hint: 'Select a date to see the booking, or to block it off.',
  blockThis: 'Block this date',
  unblockThis: 'Unblock this date',
  pastDate: 'This date has already passed.',
  rangeFrom: 'From',
  rangeTo: 'To',
  rangeApply: 'Block range',
  rangeCancel: 'Cancel',
  rangeTooLong: 'Pick a range of 62 days or fewer.',
  rangeInvalid: 'The end date must be on or after the start date.',
  customer: 'Customer',
  value: 'Value',
  status: 'Status',
} as const;

export const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;

export const CALENDAR_VIEWS: readonly CalendarView[] = ['Month', 'Week'];

/**
 * Blocking is a per-date API call, so a range fans out into one call per day.
 * Capped to keep a mis-typed year from firing thousands of requests.
 */
export const MAX_RANGE_DAYS = 62;

export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  pending: 'Booking placed',
  awaiting_organizer: 'Needs your confirmation',
  confirmed: 'Confirmed',
  in_progress: 'In progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  rejected: 'Declined',
  expired: 'Expired — no response',
};
