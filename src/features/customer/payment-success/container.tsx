import { useNavigate } from 'react-router-dom';
import { LoadingScreen, ErrorState } from '@shared/components';
import { usePaymentSuccess } from './hooks';
import { Component } from './Component';

export function PaymentSuccessContainer({ id }: { id: string }) {
  const navigate = useNavigate();
  const { data, bookingId, isLoading, isError, refetch } = usePaymentSuccess(id);

  if (isLoading) return <LoadingScreen message="Confirming your booking…" />;
  if (isError || !data) {
    return (
      <ErrorState
        message="We couldn't load your booking confirmation. It's saved — check your workspace."
        onRetry={refetch}
      />
    );
  }
  return (
    <Component
      data={data}
      onOpenWorkspace={() => navigate('/workspace')}
      onViewBooking={() => bookingId && navigate(`/booking-details/${bookingId}`)}
    />
  );
}
