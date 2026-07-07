import { useGetOrganizerProfileQuery } from '../service';

export function useProfile(id: string) {
  const { data, isLoading } = useGetOrganizerProfileQuery(id);
  return { data, isLoading };
}
