import { useGetQuoteDetailQuery } from '../service';
export function useQuoteDetail(id: string) {
  const { data, isLoading } = useGetQuoteDetailQuery(id);
  return { data, isLoading };
}
