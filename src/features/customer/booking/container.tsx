import { useNavigate } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';
import { LoadingScreen, ErrorState, EmptyState } from '@shared/components';
import { useBooking } from './hooks';
import { useCreateBookingMutation } from './service';
import { Component } from './Component';

export function BookingContainer({ quotationId }: { quotationId: string }) {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useBooking(quotationId);
  const [createBooking, { isLoading: isCreating }] = useCreateBookingMutation();

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
    try {
      const booking = await createBooking({ quotationId }).unwrap();
      navigate(`/payment-success/${booking.id}`);
    } catch {
      /* mutation error surfaces via state */
    }
  };

  return <Component data={data} isCreating={isCreating} onConfirm={confirm} />;
}
