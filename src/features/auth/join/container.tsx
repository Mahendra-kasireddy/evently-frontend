import { useRoles, useCities } from './hooks';
import { Component } from './Component';

interface QueryLike<T> {
  data?: T | undefined;
  isLoading: boolean;
  isError: boolean;
}

function toSlice<T>(q: QueryLike<T[]>) {
  return { data: q.data ?? [], isLoading: q.isLoading, isError: q.isError };
}

/** Orchestration: loads roles + cities and passes them to the presentation. */
export function JoinContainer() {
  const roles = useRoles();
  const cities = useCities();
  return <Component roles={toSlice(roles)} cities={toSlice(cities)} />;
}
