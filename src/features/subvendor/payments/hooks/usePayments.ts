import { useGetMyPerformanceQuery, useGetMyOrganizersQuery } from '../service';

export function usePayments() {
  const perf = useGetMyPerformanceQuery();
  const orgs = useGetMyOrganizersQuery();

  return {
    performance: perf.data,
    organizers: orgs.data ?? [],
    isLoading: perf.isLoading || orgs.isLoading,
    isError: perf.isError || orgs.isError,
    refetch: () => {
      void perf.refetch();
      void orgs.refetch();
    },
  };
}
