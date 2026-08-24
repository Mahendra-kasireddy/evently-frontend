import { useGetOrganizerBadgesQuery } from '@features/organizer/bookings/service';

export function useBadges() {
  const { data, isLoading, isError, refetch } = useGetOrganizerBadgesQuery();
  return { badges: data, isLoading, isError, refetch };
}
