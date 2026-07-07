/**
 * Join data hooks — backed by RTK Query (was TanStack Query). Endpoints live in
 * ../service; aliased here to the names components use.
 */
export { useGetRolesQuery as useRoles, useGetCitiesQuery as useCities } from '../service';
