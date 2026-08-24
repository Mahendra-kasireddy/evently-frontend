import { useGetMySubVendorProfileQuery } from '../service';
import { useGetMyOrganizersQuery } from '@features/subvendor/payments/service';

export function useSubvendorProfile() {
  const profileQuery = useGetMySubVendorProfileQuery();
  const orgsQuery = useGetMyOrganizersQuery();

  return {
    profile: profileQuery.data,
    organizers: orgsQuery.data ?? [],
    isLoading: profileQuery.isLoading || orgsQuery.isLoading,
    isError: profileQuery.isError || orgsQuery.isError,
    refetch: () => {
      void profileQuery.refetch();
      void orgsQuery.refetch();
    },
  };
}
