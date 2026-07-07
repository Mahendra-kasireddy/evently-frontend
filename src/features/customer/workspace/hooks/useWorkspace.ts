import { useGetWorkspaceQuery } from '../service';
export function useWorkspace() {
  const { data, isLoading } = useGetWorkspaceQuery();
  return { data, isLoading };
}
