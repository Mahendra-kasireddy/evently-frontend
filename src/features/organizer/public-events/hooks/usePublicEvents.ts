import { useMemo, useState } from 'react';
import {
  useCreatePublicEventMutation,
  useGetPublicEventsQuery,
} from '../service';
import type { PublicEventInput, PublicEventStatus } from '../types';

/**
 * The organizer's list of public events, and the one action that starts a new
 * one.
 *
 * The filter is held here rather than in the URL because it is a view of one
 * screen, not a place — a shared link to "my drafts" means nothing to anybody
 * but its owner.
 */
export function usePublicEvents() {
  const [filter, setFilter] = useState<PublicEventStatus | 'all'>('all');
  const [search, setSearch] = useState('');

  const query = useGetPublicEventsQuery(
    filter === 'all' ? (search ? { q: search } : undefined) : { status: filter, q: search || undefined },
  );

  const [createEvent, createState] = useCreatePublicEventMutation();

  const events = useMemo(() => query.data?.items ?? [], [query.data]);

  const create = async (body: PublicEventInput) => {
    const created = await createEvent(body).unwrap();
    return created;
  };

  return {
    events,
    total: query.data?.total ?? 0,
    filter,
    setFilter,
    search,
    setSearch,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    /* Handed up as it came back, so the screen can repeat what the server
       said rather than guessing at a connection problem. */
    loadError: query.error ?? null,
    refetch: query.refetch,
    create,
    isCreating: createState.isLoading,
    /* The server's sentence, not a shrug. The client rejects with a normalised
       `{ status, message }`, so the message is on the error itself rather than
       under `data`. */
    createError: createState.error
      ? ((createState.error as { message?: string }).message ??
        'That event could not be created. Check the fields and try again.')
      : null,
  };
}
