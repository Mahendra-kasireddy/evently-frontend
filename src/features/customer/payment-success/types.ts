export type NextIcon = 'chat' | 'sparkles' | 'list';
export interface NextStep { icon: NextIcon; title: string; desc: string }
export interface PaymentSuccessData {
  title: string;
  subtitle: string;
  bookingId: string;
  whatsappNote: string;
  whatNext: NextStep[];
  ctaLabel: string;
  viewLabel: string;
  downloadLabel: string;
}
