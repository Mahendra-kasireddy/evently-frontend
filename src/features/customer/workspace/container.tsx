import { LoadingScreen, ErrorState } from '@shared/components';
import { useWorkspace } from './hooks';
import { Component } from './Component';

export function WorkspaceContainer() {
  const { plans, quotes, bookings, isLoading, isError, refetch } = useWorkspace();

  if (isLoading) return <LoadingScreen message="Opening your workspace…" />;
  if (isError) {
    return (
      <ErrorState
        message="We couldn't load your workspace. Please check your connection and try again."
        onRetry={refetch}
      />
    );
  }
  return <Component plans={plans} quotes={quotes} bookings={bookings} />;
}
