import { LoadingScreen } from '@shared/components';
import { useDiscover } from './hooks';
import { Component } from './Component';

export function DiscoverContainer() {
  const { data, isLoading } = useDiscover();
  if (isLoading || !data) return <LoadingScreen message="Finding organizers…" />;
  return <Component data={data} />;
}
