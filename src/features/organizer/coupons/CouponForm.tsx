import { useState } from 'react';
import { Btn, Card } from '@shared/partner';
import { COUPONS_COPY as COPY } from './constants';
import type { CouponTermsInput } from './types';
import styles from './styles.module.css';

/**
 * A new coupon, as a form.
 *
 * There is no organizer or scope field. Those are not choices an organizer
 * makes — the server sets both from the session, and a control offering them
 * would imply an organizer could issue somebody else's coupon.
 *
 * The only checking done here is whether the form is filled in enough to be
 * worth sending. Whether the terms are legal is the server's answer, given
 * once, so the console cannot come to a different one.
 */
export function CouponForm({
  busy,
  error,
  onCancel,
  onSubmit,
}: {
  busy: boolean;
  error: string | null;
  onCancel: () => void;
  onSubmit: (terms: CouponTermsInput) => void;
}) {
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [maxDiscount, setMaxDiscount] = useState('0');
  const [minBookingAmount, setMinBooking] = useState('0');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [usageLimit, setUsageLimit] = useState('0');
  const [perCustomerLimit, setPerCustomer] = useState('1');

  const value = Number(discountValue);
  const ready = code.trim().length >= 4 && title.trim().length >= 3 && value >= 1 && !busy;

  return (
    <Card className={styles.panel}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!ready) return;
          onSubmit({
            code: code.trim().toUpperCase(),
            title: title.trim(),
            description: description.trim(),
            discountType,
            discountValue: value,
            // A ceiling on a fixed discount means nothing, so it is not sent.
            maxDiscount: discountType === 'percentage' ? numberOr(maxDiscount, 0) : 0,
            minBookingAmount: numberOr(minBookingAmount, 0),
            startsAt: startsAt ? new Date(startsAt).toISOString() : null,
            endsAt: endsAt ? endOfDay(endsAt) : null,
            usageLimit: numberOr(usageLimit, 0),
            perCustomerLimit: numberOr(perCustomerLimit, 1),
          });
        }}
      >
        <div className={styles.formGrid}>
          <Field label={COPY.fields.code}>
            <input
              className={styles.input}
              value={code}
              placeholder="MONSOON15"
              maxLength={20}
              onChange={(event) => setCode(event.target.value.toUpperCase())}
            />
          </Field>

          <Field label={COPY.fields.title}>
            <input
              className={styles.input}
              value={title}
              placeholder="15% off monsoon bookings"
              maxLength={80}
              onChange={(event) => setTitle(event.target.value)}
            />
          </Field>

          <Field label={COPY.fields.description}>
            <input
              className={styles.input}
              value={description}
              placeholder="Shown to the customer under the code"
              maxLength={300}
              onChange={(event) => setDescription(event.target.value)}
            />
          </Field>

          <Field label={COPY.fields.discountType}>
            <select
              className={styles.input}
              value={discountType}
              onChange={(event) => setDiscountType(event.target.value as 'percentage' | 'fixed')}
            >
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed amount</option>
            </select>
          </Field>

          <Field label={discountType === 'percentage' ? COPY.fields.percent : COPY.fields.rupees}>
            <input
              className={styles.input}
              type="number"
              min={1}
              value={discountValue}
              onChange={(event) => setDiscountValue(event.target.value)}
            />
          </Field>

          {discountType === 'percentage' ? (
            <Field label={COPY.fields.maxDiscount}>
              <input
                className={styles.input}
                type="number"
                min={0}
                value={maxDiscount}
                onChange={(event) => setMaxDiscount(event.target.value)}
              />
            </Field>
          ) : null}

          <Field label={COPY.fields.minBooking}>
            <input
              className={styles.input}
              type="number"
              min={0}
              value={minBookingAmount}
              onChange={(event) => setMinBooking(event.target.value)}
            />
          </Field>

          <Field label={COPY.fields.startsAt}>
            <input
              className={styles.input}
              type="date"
              value={startsAt}
              onChange={(event) => setStartsAt(event.target.value)}
            />
          </Field>

          <Field label={COPY.fields.endsAt}>
            <input
              className={styles.input}
              type="date"
              value={endsAt}
              onChange={(event) => setEndsAt(event.target.value)}
            />
          </Field>

          <Field label={COPY.fields.usageLimit}>
            <input
              className={styles.input}
              type="number"
              min={0}
              value={usageLimit}
              onChange={(event) => setUsageLimit(event.target.value)}
            />
          </Field>

          <Field label={COPY.fields.perCustomer}>
            <input
              className={styles.input}
              type="number"
              min={0}
              value={perCustomerLimit}
              onChange={(event) => setPerCustomer(event.target.value)}
            />
          </Field>
        </div>

        {error ? (
          <p className={styles.note} role="alert" style={{ marginTop: 12, color: 'var(--c-red)' }}>
            {error}
          </p>
        ) : null}

        <div className={styles.formActions}>
          <Btn kind="ghost" sm onClick={onCancel}>
            {COPY.cancel}
          </Btn>
          <Btn type="submit" sm disabled={!ready}>
            {busy ? 'Creating…' : COPY.save}
          </Btn>
        </div>
      </form>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className={styles.field}>
      <span className={styles.label}>{label}</span>
      {children}
    </label>
  );
}

/**
 * An end date means the end of that day.
 *
 * A coupon picked to run "until the 31st" that stops working at midnight on
 * the 30th is experienced as the offer simply being broken.
 */
function endOfDay(value: string): string {
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);
  return date.toISOString();
}

function numberOr(value: string, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : fallback;
}
