import { useNavigate } from 'react-router-dom';
import { CalendarX } from 'lucide-react';
import { LoadingScreen, ErrorState, EmptyState } from '@shared/components';
import { useBookingDetail } from './hooks';
import { Component } from './Component';

export function BookingDetailContainer({ id }: { id: string }) {
  const navigate = useNavigate();
  const { booking, isLoading, isError, refetch, cancel, isCancelling } = useBookingDetail(id);

  if (isLoading) return <LoadingScreen message="Loading your booking…" />;
  if (isError) {
    return (
      <ErrorState
        message="We couldn't load this booking. Please try again."
        onRetry={refetch}
      />
    );
  }
  if (!booking) {
    return (
      <div style={{ maxWidth: 640, margin: '80px auto', padding: '0 20px' }}>
        <EmptyState
          icon={CalendarX}
          title="Booking not found"
          message="This booking isn’t available."
          actionLabel="Back to workspace"
          onAction={() => navigate('/workspace')}
        />
      </div>
    );
  }

  return <Component booking={booking} isCancelling={isCancelling} onCancel={() => void cancel()} />;
}
