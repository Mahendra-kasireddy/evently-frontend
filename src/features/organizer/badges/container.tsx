import { LoadingScreen, ErrorState } from '@shared/components';
import { useBadges } from './hooks';
import { Component } from './Component';

export function BadgesContainer() {
  const { badges, isLoading, isError, refetch } = useBadges();

  if (isLoading) return <LoadingScreen message="Loading your badges…" />;
  if (isError || !badges) {
    return (
      <ErrorState message="We couldn't load your badge status. Please check your connection and try again." onRetry={refetch} />
    );
  }

  return <Component badges={badges} />;
}
