/** Mirrors `CouponQuote` / `EligibleCoupon` on the Nest side. */

export type CouponDiscountType = 'percentage' | 'fixed';

/**
 * What a coupon is worth on one booking.
 *
 * Every number here was computed on the server from the quotation's own total.
 * Nothing in the browser multiplies a percentage by an amount — if it did, the
 * screen could show a saving the booking would not honour.
 */
export interface ApiCouponQuote {
  couponId: string;
  code: string;
  title: string;
  description: string;
  discountType: CouponDiscountType;
  discountValue: number;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
}

/** A coupon offered in the picker, already priced against this booking. */
export interface ApiEligibleCoupon extends ApiCouponQuote {
  scope: 'platform' | 'organizer';
  minBookingAmount: number;
  endsAt: string | null;
}
