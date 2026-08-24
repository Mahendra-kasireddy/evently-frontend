import { LoadingScreen, ErrorState } from '@shared/components';
import { useProfile } from './hooks';
import { Component } from './Component';

export function OrganizerProfileContainer({ id }: { id: string }) {
  const { data, isLoading, isError, refetch } = useProfile(id);
  if (isLoading) return <LoadingScreen message="Loading profile…" />;
  if (isError || !data) {
    return (
      <ErrorState message="We couldn't find this organizer's profile." onRetry={refetch} />
    );
  }
  return <Component profile={data} />;
}
