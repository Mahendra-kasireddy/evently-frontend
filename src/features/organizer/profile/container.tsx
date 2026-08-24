import { ErrorState, LoadingScreen } from '@shared/components';
import { useOrganizerProfile } from './hooks';
import { Component } from './Component';

export function OrganizerProfileContainer() {
  const state = useOrganizerProfile();

  if (state.isLoading) return <LoadingScreen message="Loading your profile…" />;
  if (state.isError) {
    return (
      <ErrorState
        message="We couldn't load your profile. Please check your connection and try again."
        onRetry={state.refetch}
      />
    );
  }

  return <Component {...state} />;
}
