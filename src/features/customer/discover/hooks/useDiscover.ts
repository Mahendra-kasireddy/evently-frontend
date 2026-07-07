import { useGetDiscoverQuery } from '../service';
export function useDiscover() {
  const { data, isLoading } = useGetDiscoverQuery();
  return { data, isLoading };
}
