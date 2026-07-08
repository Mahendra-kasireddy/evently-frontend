import type { NextStep } from './types';

export const PAYMENT_SUCCESS_ROUTE = '/payment-success';

/** UI copy — the "what happens next" steps shown after a booking is placed. */
export const WHAT_NEXT: NextStep[] = [
  { icon: 'chat', title: 'Your organizer reaches out', desc: 'They confirm details and next steps shortly.' },
  { icon: 'sparkles', title: 'Share your ideas', desc: 'Add inspirations & surprises on the planning board.' },
  { icon: 'list', title: 'Track every step', desc: 'Watch each category come together up to event day.' },
];
