import { useState } from 'react';
import { useGetAvailableCouponsQuery, usePreviewCouponMutation } from './service';
import type { ApiCouponQuote } from './types';

export interface CouponState {
  /** Coupons this customer can actually use here, best saving first. */
  available: ReturnType<typeof useGetAvailableCouponsQuery>['data'];
  /** The one currently applied, priced by the server. */
  applied: ApiCouponQuote | null;
  code: string;
  setCode: (value: string) => void;
  isChecking: boolean;
  error: string | null;
  apply: (code: string) => void;
  remove: () => void;
}

/**
 * The coupon the customer is applying at checkout.
 *
 * Applying only asks the server what the code is worth; it does not reserve
 * anything. The coupon is judged again — by the same code path — when the
 * booking is written, which is the only moment that decides what is charged.
 * So a coupon that expires or runs out in between is caught there, and this
 * screen never has to pretend it holds one.
 *
 * The error is the server's sentence, not a category: "This coupon needs a
 * booking of ₹2,50,000 or more" is something a customer can act on, and
 * "invalid coupon" is not.
 */
export function useCoupon(quotationId: string): CouponState {
  const { data: available } = useGetAvailableCouponsQuery(quotationId, { skip: !quotationId });
  const [previewCoupon, { isLoading }] = usePreviewCouponMutation();

  const [applied, setApplied] = useState<ApiCouponQuote | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const apply = (raw: string) => {
    const trimmed = raw.trim().toUpperCase();
    if (!trimmed) return;
    setError(null);

    void previewCoupon({ quotationId, code: trimmed })
      .unwrap()
      .then((quote) => {
        setApplied(quote);
        setCode(quote.code);
      })
      .catch((cause: { message?: string }) => {
        setApplied(null);
        setError(cause?.message || 'That coupon could not be applied.');
      });
  };

  return {
    available,
    applied,
    code,
    setCode,
    isChecking: isLoading,
    error,
    apply,
    remove: () => {
      setApplied(null);
      setCode('');
      setError(null);
    },
  };
}
