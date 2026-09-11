import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';
import { LoadingScreen, ErrorState, EmptyState } from '@shared/components';
import { useCoupon } from '@features/customer/coupons/useCoupon';
import { useBooking } from './hooks';
import { useCreateBookingMutation } from './service';
import { CouponBox } from './sections';
import { Component } from './Component';

export function BookingContainer({ quotationId }: { quotationId: string }) {
  const navigate = useNavigate();
  const coupon = useCoupon(quotationId);
  // The checkout view is rebuilt around the applied coupon, so the advance,
  // the balance and the button all move together with the total.
  const { data, isLoading, isError, refetch } = useBooking(quotationId, coupon.applied);
  const [createBooking, { isLoading: isCreating }] = useCreateBookingMutation();
  const [confirmError, setConfirmError] = useState<string | null>(null);

  if (!quotationId) {
    return (
      <div style={{ maxWidth: 640, margin: '80px auto', padding: '0 20px' }}>
        <EmptyState
          icon={FileQuestion}
          title="Nothing to book"
          message="Accept a quotation first, and we’ll bring you here to confirm your booking."
          actionLabel="Go to My Events"
          onAction={() => navigate('/workspace')}
        />
      </div>
    );
  }
  if (isLoading) return <LoadingScreen message="Loading booking…" />;
  if (isError || !data) {
    return (
      <ErrorState
        message="We couldn't load this booking. The quote may have changed — try again."
        onRetry={refetch}
      />
    );
  }

  const confirm = async () => {
    setConfirmError(null);
    try {
      /*
       * Only the code goes with it. The server re-validates the coupon and
       * recomputes the discount against the quotation before it writes the
       * booking, so a coupon that expired or ran out while this page was open
       * is caught there rather than being honoured on this screen's word.
       */
      const booking = await createBooking({
        quotationId,
        ...(coupon.applied ? { couponCode: coupon.applied.code } : {}),
      }).unwrap();
      navigate(`/payment-success/${booking.id}`);
    } catch (cause) {
      // A refused coupon is the likely reason, and its reason is worth reading.
      const message = (cause as { message?: string })?.message;
      setConfirmError(message || 'We could not confirm this booking. Please try again.');
      coupon.remove();
    }
  };

  return (
    <Component
      data={data}
      isCreating={isCreating}
      onConfirm={confirm}
      coupon={
        <CouponBox
          available={coupon.available ?? []}
          applied={coupon.applied}
          isChecking={coupon.isChecking}
          error={confirmError ?? coupon.error}
          onApply={coupon.apply}
          onRemove={coupon.remove}
        />
      }
    />
  );
}
