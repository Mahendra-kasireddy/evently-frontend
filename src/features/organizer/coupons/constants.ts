import type { ApiCoupon } from './types';

export const COUPONS_COPY = {
  title: 'My coupons',
  create: 'New coupon',
  cancel: 'Cancel',
  save: 'Create coupon',
  /*
   * Said once, at the top. Organizers already set their own quotation totals
   * with no review, so a coupon of theirs needs none either — and being told
   * that up front is better than wondering whether it is waiting on somebody.
   */
  liveNote: 'Your coupons go live as soon as you create them. Customers see them at checkout on your quotes.',
  emptyTitle: 'No coupons yet',
  emptyBody: 'Create one and it will show up at checkout for customers booking you.',
  usageTitle: 'Usage',
  usageEmpty: 'Nobody has used one of your coupons yet.',
  disable: 'Disable',
  enable: 'Enable',
  columns: {
    code: 'Code',
    discount: 'Discount',
    minimum: 'Minimum',
    used: 'Used',
    ends: 'Ends',
    status: 'Status',
  },
  usageColumns: {
    customer: 'Customer',
    booking: 'Booking',
    code: 'Code',
    before: 'Before',
    discount: 'Discount',
    charged: 'Charged',
    when: 'When',
  },
  fields: {
    code: 'Code',
    title: 'Title',
    description: 'Description',
    discountType: 'Discount type',
    percent: 'Percent off',
    rupees: 'Rupees off',
    maxDiscount: 'Maximum discount (₹, 0 = uncapped)',
    minBooking: 'Minimum booking (₹, 0 = none)',
    startsAt: 'Starts (blank = now)',
    endsAt: 'Ends (blank = no end)',
    usageLimit: 'Total uses (0 = unlimited)',
    perCustomer: 'Uses per customer (0 = unlimited)',
  },
} as const;

/** How a coupon's terms read in one line. */
export function discountLabel(
  coupon: Pick<ApiCoupon, 'discountType' | 'discountValue' | 'maxDiscount'>,
): string {
  if (coupon.discountType === 'fixed') {
    return `₹${coupon.discountValue.toLocaleString('en-IN')} off`;
  }
  const cap = coupon.maxDiscount > 0 ? ` (max ₹${coupon.maxDiscount.toLocaleString('en-IN')})` : '';
  return `${coupon.discountValue}% off${cap}`;
}

/**
 * How much of the coupon is gone.
 *
 * An unlimited coupon reports a count rather than inventing a denominator.
 */
export function usageLabel(coupon: Pick<ApiCoupon, 'usedCount' | 'usageLimit'>): string {
  return coupon.usageLimit > 0 ? `${coupon.usedCount} / ${coupon.usageLimit}` : `${coupon.usedCount}`;
}

export function shortDate(iso: string | null): string {
  if (!iso) return '—';
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
