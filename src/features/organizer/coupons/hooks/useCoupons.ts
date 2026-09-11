import { useState } from 'react';
import {
  useCreateMyCouponMutation,
  useGetMyCouponUsageQuery,
  useGetMyCouponsQuery,
  useSetMyCouponStatusMutation,
} from '../service';
import type { CouponTermsInput } from '../types';

/**
 * The organizer's coupons, and the state of creating one.
 *
 * The create error is whatever the server said. Coupon rules — the code
 * already being taken, a percentage over 100, an end date before the start —
 * are decided in one place on the server, and repeating them here is how the
 * two copies start disagreeing about which coupons are legal.
 */
export function useCoupons() {
  const { data: coupons = [], isLoading, isError, refetch } = useGetMyCouponsQuery();
  const { data: usage = [] } = useGetMyCouponUsageQuery();
  const [createMutation, createState] = useCreateMyCouponMutation();
  const [statusMutation] = useSetMyCouponStatusMutation();
  const [createError, setCreateError] = useState<string | null>(null);

  const create = async (terms: CouponTermsInput): Promise<boolean> => {
    setCreateError(null);
    try {
      await createMutation(terms).unwrap();
      return true;
    } catch (error) {
      const message = (error as { message?: string })?.message;
      setCreateError(message || 'Could not create that coupon. Please try again.');
      return false;
    }
  };

  const setStatus = (id: string, status: 'active' | 'disabled') =>
    void statusMutation({ id, status });

  return {
    coupons,
    usage,
    isLoading,
    isError,
    refetch,
    create,
    isCreating: createState.isLoading,
    createError,
    clearCreateError: () => setCreateError(null),
    setStatus,
  };
}
