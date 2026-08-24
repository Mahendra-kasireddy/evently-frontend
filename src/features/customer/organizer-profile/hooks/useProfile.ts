import { useGetOrganizerProfileQuery } from '../service';

export function useProfile(id: string) {
  const { data, isLoading, isError, refetch } = useGetOrganizerProfileQuery(id);
  return { data, isLoading, isError, refetch };
}
