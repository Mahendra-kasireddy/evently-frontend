import { useState } from 'react';
import { X } from 'lucide-react';
import type { ApiCouponQuote, ApiEligibleCoupon } from '@features/customer/coupons/types';
import { formatINR } from '@features/customer/quotes/transform';
import styles from './CouponBox.module.css';

export interface CouponBoxProps {
  available: ApiEligibleCoupon[];
  applied: ApiCouponQuote | null;
  isChecking: boolean;
  error: string | null;
  onApply: (code: string) => void;
  onRemove: () => void;
}

/**
 * Applying a coupon, at the point where the total is.
 *
 * The offers listed underneath are the coupons this customer can actually use
 * on this booking, priced by the server and best saving first. Expired,
 * disabled, exhausted, already-used and too-small-basket coupons are not
 * listed at all — a row you cannot have, greyed out with an explanation, is
 * not an offer.
 *
 * The saving shown on each row is the server's number for this exact booking,
 * not "20% off" left for the customer to work out against a total they would
 * have to scroll to find.
 */
export function CouponBox({
  available,
  applied,
  isChecking,
  error,
  onApply,
  onRemove,
}: CouponBoxProps) {
  const [draft, setDraft] = useState('');

  if (applied) {
    return (
      <div className={styles.box}>
        <p className={styles.label}>COUPON</p>
        <div className={styles.applied}>
          <div className={styles.appliedText}>
            <span className={styles.appliedCode}>
              {applied.code} · {formatINR(applied.discountAmount)} off
            </span>
            <span className={styles.appliedNote}>{applied.title}</span>
          </div>
          <button
            type="button"
            className={styles.remove}
            onClick={onRemove}
            aria-label={`Remove coupon ${applied.code}`}
          >
            <X size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.box}>
      <p className={styles.label}>HAVE A COUPON?</p>
      <form
        className={styles.form}
        onSubmit={(event) => {
          event.preventDefault();
          onApply(draft);
        }}
      >
        <input
          className={styles.input}
          value={draft}
          placeholder="Enter code"
          aria-label="Coupon code"
          maxLength={20}
          onChange={(event) => setDraft(event.target.value.toUpperCase())}
        />
        <button
          type="submit"
          className={styles.apply}
          disabled={draft.trim().length < 4 || isChecking}
        >
          {isChecking ? 'Checking…' : 'Apply'}
        </button>
      </form>

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      {available.length > 0 ? (
        <div className={styles.offers}>
          {available.map((coupon) => (
            <button
              key={coupon.couponId}
              type="button"
              className={styles.offer}
              onClick={() => onApply(coupon.code)}
            >
              <span>
                <span className={styles.offerCode}>{coupon.code}</span>
                <span className={styles.offerTitle}>{coupon.title}</span>
              </span>
              <span className={styles.offerSaving}>−{formatINR(coupon.discountAmount)}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
