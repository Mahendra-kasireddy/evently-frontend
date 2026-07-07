import { useGetQuotesQuery } from '../service';
export function useQuotes() {
  const { data, isLoading } = useGetQuotesQuery();
  return { data, isLoading };
}
