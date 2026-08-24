import { LoadingScreen, ErrorState } from '@shared/components';
import { useDiscover } from './hooks';
import { Component } from './Component';

export function DiscoverContainer() {
  const { data, isLoading, isError } = useDiscover();
  if (isLoading || !data) return <LoadingScreen message="Finding organizers…" />;
  if (isError) {
    return (
      <ErrorState
        message="We couldn't load organizers. Please check your connection and try again."
      />
    );
  }
  return <Component data={data} />;
}
