import { useSearchParams } from 'react-router-dom';
import { useGetIncomingQuotesQuery } from '../service';

/** The requests currently visible to the logged-in organizer (targeted or open). */
export function useIncomingQuotes() {
  const query = useGetIncomingQuotesQuery();
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q')?.trim().toLowerCase() ?? '';

  const all = query.data ?? [];
  const requests = q
    ? all.filter((r) =>
        // Now that the API returns it, the customer's name is the most likely
        // thing an organizer types into the top-bar search.
        [r.customerName, r.occasion, r.when, r.where].some((field) => field?.toLowerCase().includes(q)),
      )
    : all;

  return {
    requests,
    totalCount: all.length,
    searchTerm: q,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
