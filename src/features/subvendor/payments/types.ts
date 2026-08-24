export interface ScoreBreakdown {
  onTimeDeliveryRate: number;
  taskCompletionRate: number;
  photoProofSubmissionRate: number;
  avgOrganizerRating: number;
}

export type PaymentStatus = 'pending' | 'processing' | 'paid';

export interface SubVendorPayment {
  bookingId: string;
  taskId: string;
  event: string;
  organizerName: string;
  amount: number;
  status: PaymentStatus;
  eventDate: string;
}

export interface SubVendorPerformance {
  performanceScore: number;
  scoreBreakdown: ScoreBreakdown;
  thisMonthEarned: number;
  pendingPayout: number;
  lifetimeEarned: number;
  payments: SubVendorPayment[];
}

export interface OrganizerRef {
  id: string;
  name: string;
}
