import { useCities } from './hooks';
import { JOIN_ROLES } from './constants';
import { Component } from './Component';

interface QueryLike<T> {
  data?: T | undefined;
  isLoading: boolean;
  isError: boolean;
}

function toSlice<T>(q: QueryLike<T[]>) {
  return { data: q.data ?? [], isLoading: q.isLoading, isError: q.isError };
}

/**
 * Orchestration: loads the real city list (GET /plan/cities) and hands it to
 * the presentation alongside the static role copy.
 */
export function JoinContainer() {
  const cities = useCities();
  return <Component roles={JOIN_ROLES} cities={toSlice(cities)} />;
}
