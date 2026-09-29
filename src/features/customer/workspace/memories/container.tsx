import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ErrorState, LoadingScreen } from '@shared/components';
import { useGetBookingQuery } from '@features/customer/booking/service';
import { bookedWorkspaceRoute } from '../routes';
import { MemoriesComponent, type MemoryAction } from './Component';
import {
  useActOnMemoryMutation,
  useDeleteMemoryMutation,
  useGetAwaitingMemoriesQuery,
  useGetManagedMemoriesQuery,
  useGetMemorySettingsQuery,
  useSaveMemorySettingsMutation,
} from './service';
import type { MemorySettings } from './service';

const COPY_FAILED = 'That could not be saved. Check your connection and try again.';
const COPY_LOADING = 'Loading your shared memories…';
const COPY_ERROR = 'We couldn’t load your shared memories. Check your connection and try again.';

/**
 * My Events → a booked event → its shared memories.
 *
 * Ownership is the server's: every one of these endpoints resolves the booking
 * from the signed-in customer before answering, so this container carries no
 * permission logic of its own — it would be a second opinion, and the wrong
 * place for one.
 */
export function MemoriesContainer({ bookingId }: { bookingId: string }) {
  const navigate = useNavigate();
  const [kind, setKindState] = useState('all');
  const [subEvent, setSubEventState] = useState('all');
  const [before, setBefore] = useState('');
  const [error, setError] = useState('');

  const bookingQ = useGetBookingQuery(bookingId, { skip: !bookingId });
  const settingsQ = useGetMemorySettingsQuery(bookingId, { skip: !bookingId });
  const awaitingQ = useGetAwaitingMemoriesQuery(bookingId, { skip: !bookingId });
  const galleryQ = useGetManagedMemoriesQuery(
    { bookingId, kind, subEvent, ...(before ? { before } : {}) },
    { skip: !bookingId },
  );

  const [save, saveState] = useSaveMemorySettingsMutation();
  const [act, actState] = useActOnMemoryMutation();
  const [remove, removeState] = useDeleteMemoryMutation();

  /* A filter change starts the list again: a cursor from one filter means
     nothing in another. */
  const setKind = useCallback((next: string) => {
    setBefore('');
    setKindState(next);
  }, []);
  const setSubEvent = useCallback((next: string) => {
    setBefore('');
    setSubEventState(next);
  }, []);

  const onSetting = useCallback(
    (patch: Partial<Omit<MemorySettings, 'window'>>) => {
      setError('');
      save({ bookingId, patch })
        .unwrap()
        .catch(() => setError(COPY_FAILED));
    },
    [save, bookingId],
  );

  const onAct = useCallback(
    (mediaId: string, action: MemoryAction) => {
      setError('');
      act({ bookingId, mediaId, action })
        .unwrap()
        .catch(() => setError(COPY_FAILED));
    },
    [act, bookingId],
  );

  const onDelete = useCallback(
    (mediaId: string) => {
      setError('');
      remove({ bookingId, mediaId })
        .unwrap()
        .catch(() => setError(COPY_FAILED));
    },
    [remove, bookingId],
  );

  if (bookingQ.isLoading || settingsQ.isLoading) {
    return <LoadingScreen message={COPY_LOADING} />;
  }
  /*
   * A 404 here is the ordinary early state, not a failure: the invitation is
   * still the organizer's draft, so there is nothing to configure yet.
   */
  if (settingsQ.isError || !settingsQ.data) {
    return <ErrorState message={COPY_ERROR} onRetry={() => void settingsQ.refetch()} />;
  }

  return (
    <MemoriesComponent
      eventTitle={bookingQ.data?.title ?? ''}
      settings={settingsQ.data}
      awaiting={awaitingQ.data ?? []}
      gallery={galleryQ.data}
      kind={kind}
      subEvent={subEvent}
      busy={
        saveState.isLoading ||
        actState.isLoading ||
        removeState.isLoading ||
        galleryQ.isFetching
      }
      error={error}
      onBack={() => navigate(bookedWorkspaceRoute(bookingId))}
      onSetting={onSetting}
      onKind={setKind}
      onSubEvent={setSubEvent}
      onMore={() => setBefore(galleryQ.data?.nextCursor ?? '')}
      onAct={onAct}
      onDelete={onDelete}
    />
  );
}

export default MemoriesContainer;
