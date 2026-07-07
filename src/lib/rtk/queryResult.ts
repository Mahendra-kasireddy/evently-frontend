/** Error shape surfaced by the axios client's normalized errors. */
export interface ApiQueryError {
  status?: number;
  message?: string;
}

/**
 * Wraps an async data fetch into the `{ data } | { error }` value an RTK Query
 * `queryFn` must return — removing the repeated try/catch in every service.
 *
 *   getX: build.query<X, void>({ queryFn: () => toQueryResult(() => fetchX()) })
 */
export async function toQueryResult<T>(
  run: () => Promise<T>,
): Promise<{ data: T } | { error: ApiQueryError }> {
  try {
    return { data: await run() };
  } catch (error) {
    return { error: error as ApiQueryError };
  }
}
