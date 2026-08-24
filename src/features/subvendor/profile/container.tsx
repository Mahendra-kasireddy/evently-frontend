import { LoadingScreen, ErrorState } from '@shared/components';
import { useSubvendorProfile } from './hooks';
import { Component } from './Component';

export function SubvendorProfileContainer() {
  const { profile, organizers, isLoading, isError, refetch } = useSubvendorProfile();

  if (isLoading) return <LoadingScreen message="Loading your profile…" />;
  if (isError || !profile) {
    return (
      <ErrorState
        message="We couldn't load your profile. Please check your connection and try again."
        onRetry={refetch}
      />
    );
  }

  return <Component profile={profile} organizers={organizers} />;
}
