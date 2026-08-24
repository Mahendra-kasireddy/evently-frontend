import { LoadingScreen, ErrorState } from '@shared/components';
import { useOrganizerHome } from './hooks';
import { Component } from './Component';

export function OrganizerHomeContainer() {
  const { data, isLoading, isError, refetch, toggleTask, badges } = useOrganizerHome();

  if (isLoading) return <LoadingScreen message="Loading your dashboard…" />;
  if (isError || !data) {
    return (
      <ErrorState
        message="We couldn't load your dashboard. Please check your connection and try again."
        onRetry={refetch}
      />
    );
  }

  return <Component summary={data} onToggleTask={toggleTask} badges={badges} />;
}
