import { LoadingScreen, ErrorState } from '@shared/components';
import { usePayments } from './hooks';
import { Component } from './Component';

export function PaymentsContainer() {
  const { performance, organizers, isLoading, isError, refetch } = usePayments();

  if (isLoading) return <LoadingScreen message="Loading your performance…" />;
  if (isError || !performance) {
    return (
      <ErrorState
        message="We couldn't load your payments. Please check your connection and try again."
        onRetry={refetch}
      />
    );
  }

  return <Component performance={performance} organizers={organizers} />;
}
