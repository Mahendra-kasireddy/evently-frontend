import { CalendarX } from 'lucide-react';
import { LoadingScreen, ErrorState, EmptyState } from '@shared/components';
import { useEvents } from './hooks';
import { Component } from './Component';

export function EventsContainer() {
  const { bookings, isLoading, isError, refetch } = useEvents();

  if (isLoading) return <LoadingScreen message="Loading your events…" />;
  if (isError) {
    return (
      <ErrorState
        message="We couldn't load your events. Please check your connection and try again."
        onRetry={refetch}
      />
    );
  }
  if (bookings.length === 0) {
    return (
      <div style={{ maxWidth: 640, margin: '80px auto', padding: '0 20px' }}>
        <EmptyState
          icon={CalendarX}
          title="No active events yet"
          message="Once a customer accepts one of your quotes, it'll show up here so you can track delivery."
        />
      </div>
    );
  }

  return <Component bookings={bookings} />;
}
