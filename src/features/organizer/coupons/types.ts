/** Mirrors `CouponView` / `RedemptionView` on the Nest side. */

export type CouponScope = 'platform' | 'organizer';
export type CouponDiscountType = 'percentage' | 'fixed';
export type CouponStatus = 'active' | 'disabled';
export type RedemptionStatus = 'redeemed' | 'reversed';

export interface ApiCoupon {
  id: string;
  code: string;
  title: string;
  description: string;
  scope: CouponScope;
  organizerId: string | null;
  organizerName: string;
  discountType: CouponDiscountType;
  discountValue: number;
  maxDiscount: number;
  minBookingAmount: number;
  startsAt: string | null;
  endsAt: string | null;
  usageLimit: number;
  perCustomerLimit: number;
  usedCount: number;
  status: CouponStatus;
  createdByRole: string;
  createdAt: string | null;
}

export interface ApiCouponRedemption {
  id: string;
  code: string;
  customerName: string;
  bookingRef: string;
  organizerName: string;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  status: RedemptionStatus;
  redeemedAt: string | null;
}

/**
 * What the create form sends.
 *
 * There is no organizer field, and no scope field, because there is nothing to
 * choose: the server reads the organizer from the session and sets the scope
 * from the fact that the organizer endpoint was the one called. A coupon
 * created here can only ever be this organizer's own.
 */
export interface CouponTermsInput {
  code: string;
  title: string;
  description: string;
  discountType: CouponDiscountType;
  discountValue: number;
  maxDiscount: number;
  minBookingAmount: number;
  startsAt: string | null;
  endsAt: string | null;
  usageLimit: number;
  perCustomerLimit: number;
}
