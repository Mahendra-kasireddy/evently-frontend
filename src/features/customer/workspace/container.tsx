import { LoadingScreen, ErrorState } from '@shared/components';
import { useWorkspace } from './hooks';
import { Component } from './Component';

export function WorkspaceContainer() {
  const { events, isLoading, isError, refetch } = useWorkspace();

  if (isLoading) return <LoadingScreen message="Opening your events…" />;
  if (isError) {
    return (
      <ErrorState
        message="We couldn't load your events. Please check your connection and try again."
        onRetry={refetch}
      />
    );
  }
  return <Component events={events} />;
}
