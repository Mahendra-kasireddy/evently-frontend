// ---- Checkout view model (built from the accepted quotation) ----
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

// ---- Booking API shapes (MongoDB-backed) ----
export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'rejected';

export interface BookingOrganizer {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  tier: string;
  rating: number;
}
export interface BookingStep { label: string; done: boolean }
export interface BookingTimelineEntry { status: string; label: string; note?: string; at?: string }

export type BookingTaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskAssignmentStatus = 'unassigned' | 'pending' | 'accepted' | 'declined';
export interface BookingTaskFile { url: string; key: string; originalName: string }
/** Organizer-authored execution to-do — see backend BookingTask. */
export interface ApiBookingTask {
  id: string;
  title: string;
  status: BookingTaskStatus;
  assigneeName: string;
  subVendorId: string | null;
  assignmentStatus: TaskAssignmentStatus;
  amount: number;
  dueDate: string | null;
  photoProof: BookingTaskFile | null;
}

export interface BookingCustomerRef { id: string; name: string }

export interface ApiBooking {
  id: string;
  ref: string;
  title: string;
  description: string;
  occasion: string;
  location: string;
  eventDate?: string;
  daysToGo: number;
  amount: number;
  advanceAmount: number;
  balanceAmount: number;
  progress: number;
  steps: BookingStep[];
  tasks: ApiBookingTask[];
  timeline: BookingTimelineEntry[];
  status: BookingStatus;
  organizer: BookingOrganizer | null;
  customer: BookingCustomerRef | null;
  quotationId: string | null;
  createdAt?: string;
  updatedAt?: string;
}
