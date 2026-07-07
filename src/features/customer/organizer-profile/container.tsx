import { LoadingScreen } from '@shared/components';
import { useProfile } from './hooks';
import { Component } from './Component';

export function OrganizerProfileContainer({ id }: { id: string }) {
  const { data, isLoading } = useProfile(id);
  if (isLoading || !data) return <LoadingScreen message="Loading profile…" />;
  return <Component profile={data} />;
}
