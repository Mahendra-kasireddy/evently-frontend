import { useState } from 'react';
import { Plus, Ticket } from 'lucide-react';
import { Btn, Card, EmptyBox, Notice, PageStack, Status, formatInr } from '@shared/partner';
import { COUPONS_COPY as COPY, discountLabel, shortDate, usageLabel } from './constants';
import { CouponForm } from './CouponForm';
import type { ApiCoupon, ApiCouponRedemption, CouponTermsInput } from './types';
import styles from './styles.module.css';

export interface CouponsComponentProps {
  coupons: ApiCoupon[];
  usage: ApiCouponRedemption[];
  isCreating: boolean;
  createError: string | null;
  onCreate: (terms: CouponTermsInput) => Promise<boolean>;
  onClearError: () => void;
  onSetStatus: (id: string, status: 'active' | 'disabled') => void;
}

/**
 * The organizer's coupons and what they have cost.
 *
 * Usage is read from the redemption ledger rather than the counter on the
 * coupon, so the money column is the money actually taken off bookings — not a
 * multiplication of the discount by a count.
 */
export function Component({
  coupons,
  usage,
  isCreating,
  createError,
  onCreate,
  onClearError,
  onSetStatus,
}: CouponsComponentProps) {
  const [formOpen, setFormOpen] = useState(false);

  const redeemed = usage.filter((row) => row.status === 'redeemed');
  const given = redeemed.reduce((sum, row) => sum + row.discountAmount, 0);

  return (
    <PageStack>
      <div className={styles.head}>
        <div>
          <h2 className={styles.title}>{COPY.title}</h2>
          <p className={styles.note}>{COPY.liveNote}</p>
        </div>
        <Btn
          icon={<Plus size={15} />}
          onClick={() => {
            onClearError();
            setFormOpen((open) => !open);
          }}
        >
          {formOpen ? COPY.cancel : COPY.create}
        </Btn>
      </div>

      {formOpen ? (
        <CouponForm
          busy={isCreating}
          error={createError}
          onCancel={() => setFormOpen(false)}
          onSubmit={(terms) => {
            void onCreate(terms).then((ok) => {
              if (ok) setFormOpen(false);
            });
          }}
        />
      ) : null}

      {coupons.length === 0 ? (
        <EmptyBox icon={<Ticket size={22} />} title={COPY.emptyTitle} body={COPY.emptyBody} />
      ) : (
        <Card>
          <div className={styles.scroller}>
            <div className={styles.table} role="table" aria-label={COPY.title}>
              <div className={`${styles.row} ${styles.rowHead}`} role="row">
                <span role="columnheader">{COPY.columns.code}</span>
                <span role="columnheader">{COPY.columns.discount}</span>
                <span role="columnheader">{COPY.columns.minimum}</span>
                <span role="columnheader">{COPY.columns.used}</span>
                <span role="columnheader">{COPY.columns.ends}</span>
                <span role="columnheader">{COPY.columns.status}</span>
                <span role="columnheader" aria-label="Actions" />
              </div>

              {coupons.map((coupon) => {
                const active = coupon.status === 'active';
                return (
                  <div className={styles.row} role="row" key={coupon.id}>
                    <span role="cell">
                      <span className={styles.code}>{coupon.code}</span>
                      <div className={styles.sub}>{coupon.title}</div>
                    </span>
                    <span role="cell">{discountLabel(coupon)}</span>
                    <span role="cell" className={styles.mono}>
                      {coupon.minBookingAmount > 0 ? formatInr(coupon.minBookingAmount) : '—'}
                    </span>
                    <span role="cell" className={styles.mono}>
                      {usageLabel(coupon)}
                    </span>
                    <span role="cell" className={styles.mono}>
                      {coupon.endsAt ? shortDate(coupon.endsAt) : 'No end'}
                    </span>
                    <span role="cell">
                      <Status tone={active ? 'green' : 'navy'}>
                        {active ? 'Active' : 'Disabled'}
                      </Status>
                    </span>
                    <span role="cell">
                      <Btn
                        kind="ghost"
                        sm
                        onClick={() => onSetStatus(coupon.id, active ? 'disabled' : 'active')}
                      >
                        {active ? COPY.disable : COPY.enable}
                      </Btn>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      <Card>
        <div className={styles.head}>
          <h2 className={styles.title}>{COPY.usageTitle}</h2>
          {redeemed.length > 0 ? (
            <p className={styles.note}>
              {redeemed.length} redemption{redeemed.length === 1 ? '' : 's'} · {formatInr(given)}{' '}
              given away
            </p>
          ) : null}
        </div>

        {usage.length === 0 ? (
          <Notice tone="navy">{COPY.usageEmpty}</Notice>
        ) : (
          <div className={styles.scroller}>
            <div className={styles.table} role="table" aria-label={COPY.usageTitle}>
              <div className={`${styles.usageRow} ${styles.rowHead}`} role="row">
                <span role="columnheader">{COPY.usageColumns.customer}</span>
                <span role="columnheader">{COPY.usageColumns.booking}</span>
                <span role="columnheader">{COPY.usageColumns.code}</span>
                <span role="columnheader">{COPY.usageColumns.before}</span>
                <span role="columnheader">{COPY.usageColumns.discount}</span>
                <span role="columnheader">{COPY.usageColumns.charged}</span>
                <span role="columnheader">{COPY.usageColumns.when}</span>
              </div>
              {usage.map((row) => (
                <div className={styles.usageRow} role="row" key={row.id}>
                  <span role="cell">
                    {row.customerName}
                    {/* A reversal is a booking that never happened; the coupon
                        went back, so it did not cost anything. */}
                    {row.status === 'reversed' ? (
                      <div className={styles.sub}>Returned — booking did not go ahead</div>
                    ) : null}
                  </span>
                  <span role="cell" className={styles.mono}>
                    {row.bookingRef || '—'}
                  </span>
                  <span role="cell">{row.code}</span>
                  <span role="cell" className={styles.mono}>
                    {formatInr(row.originalAmount)}
                  </span>
                  <span role="cell" className={styles.mono}>
                    −{formatInr(row.discountAmount)}
                  </span>
                  <span role="cell" className={styles.mono}>
                    {formatInr(row.finalAmount)}
                  </span>
                  <span role="cell" className={styles.mono}>
                    {shortDate(row.redeemedAt)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </PageStack>
  );
}
