import { useGetPlanDataQuery } from '@features/customer/plan/service';
import { DISCOVER_COPY } from '../constants';
import { useGetDiscoverOrganizersQuery } from '../service';
import type { DiscoverData } from '../types';

/** Real organizers (GET /organizer/getTopOrganizers) + real filter options
 * (GET /plan/getPlanScreen, the same source Plan's identical FindOrganizers
 * step already uses) — no mock data. */
export function useDiscover(): { data: DiscoverData | undefined; isLoading: boolean; isError: boolean } {
  const organizersQ = useGetDiscoverOrganizersQuery();
  const planQ = useGetPlanDataQuery();

  const data: DiscoverData | undefined =
    organizersQ.data && planQ.data
      ? {
          ...DISCOVER_COPY,
          organizers: organizersQ.data,
          filters: planQ.data.filters,
        }
      : undefined;

  return {
    data,
    isLoading: organizersQ.isLoading || planQ.isLoading,
    isError: organizersQ.isError || planQ.isError,
  };
}
