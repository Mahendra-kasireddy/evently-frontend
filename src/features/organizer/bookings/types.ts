// Organizer-side view of the same booking module the customer features
// already model — reuse the raw API types rather than redefining them.
import type {
  ApiBooking,
  ApiBookingTask,
  BookingStatus,
  BookingTaskStatus,
} from '@features/customer/booking/types';
import type { ApiIncomingRequest } from '@features/organizer/quotes/types';

export type { ApiBooking, ApiBookingTask, BookingStatus, BookingTaskStatus };

export interface DashboardTask {
  id: string;
  bookingId: string;
  title: string;
  status: BookingTaskStatus;
}

export interface DashboardScheduleItem {
  id: string;
  eventDate: string;
  title: string;
  customerName: string;
}

export interface OrganizerDashboard {
  newEnquiries: number;
  activeBookings: number;
  monthEarnings: number;
  monthEarningsChangePercent: number | null;
  avgRating: number;
  todaysTasks: DashboardTask[];
  next7Days: DashboardScheduleItem[];
  pendingEnquiries: ApiIncomingRequest[];
}

export interface CalendarBookedDate {
  date: string;
  bookingId: string;
  title: string;
  customerName: string;
  /** Venue, shown on the calendar's day panel. */
  location: string;
  amount: number;
  status: BookingStatus;
}

export interface OrganizerCalendar {
  bookedDates: CalendarBookedDate[];
  blockedDates: string[];
}

export interface CreateTaskArgs {
  bookingId: string;
  title: string;
  assigneeName?: string;
  dueDate?: string;
  subVendorId?: string;
  amount?: number;
}

export interface UpdateTaskArgs {
  bookingId: string;
  taskId: string;
  title?: string;
  status?: BookingTaskStatus;
  assigneeName?: string;
  dueDate?: string;
  photoProof?: TaskProofFile;
  subVendorId?: string | null;
  amount?: number;
}

/** Uploaded-file metadata returned by POST /upload. */
export interface TaskProofFile {
  url: string;
  key: string;
  originalName?: string;
}

export interface MonthlyEarning {
  label: string;
  amount: number;
}

export interface EventMixSlice {
  occasion: string;
  percent: number;
}

export type PayoutStatus = 'pending' | 'paid';

export interface EarningsTransaction {
  id: string;
  ref: string;
  customerName: string;
  eventDate: string;
  amount: number;
  commission: number;
  net: number;
  payoutStatus: PayoutStatus;
}

export interface OrganizerEarnings {
  totalEarned: number;
  commission: number;
  netPayout: number;
  pendingPayout: number;
  commissionRate: number;
  monthlyEarnings: MonthlyEarning[];
  eventMix: EventMixSlice[];
  transactions: EarningsTransaction[];
}

export interface TierLadderEntry {
  tier: string;
  commissionRate: number;
}

export interface TierRequirements {
  events: number;
  avgRating: number;
  trainingStage: number;
  maxComplaints: number;
}

export interface BadgeStatus {
  currentTier: string;
  commissionRate: number;
  events: number;
  avgRating: number;
  trainingStage: number;
  complaintsCount: number;
  nextTier: string | null;
  nextRequirements: TierRequirements | null;
  tierLadder: TierLadderEntry[];
}
