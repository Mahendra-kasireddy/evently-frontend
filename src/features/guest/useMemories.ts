import { useCallback, useMemo, useState } from 'react';
import type { MemoryItem } from '@features/invitation';
import {
  useAddMemoryMutation,
  useDownloadMemoryMutation,
  useGetMemoriesQuery,
  useKeepMemoryMutation,
  useLikeMemoryMutation,
} from './service';

/**
 * The gallery's state, kept out of the page.
 *
 * Pages accumulate locally as the guest asks for more, and reset the moment a
 * filter changes — a cursor from the "all" list means nothing in the "reels"
 * list, so carrying the old rows forward would show reels above photographs
 * and then fetch the wrong next page.
 *
 * Nothing here filters anything. The tab and the celebration go to the server
 * and a page comes back that is already this guest's.
 */
export function useMemories(token: string, enabled: boolean) {
  const [kind, setKindState] = useState('all');
  const [subEvent, setSubEventState] = useState('all');
  const [pages, setPages] = useState<MemoryItem[][]>([]);
  const [before, setBefore] = useState('');
  const [say, setSay] = useState('');
  const [sayWarn, setSayWarn] = useState(false);
  const [keepId, setKeepId] = useState('');

  const query = useGetMemoriesQuery(
    { token, kind, subEvent, ...(before ? { before } : {}) },
    { skip: !token || !enabled },
  );

  const [addMemory, addState] = useAddMemoryMutation();
  const [keepMemory] = useKeepMemoryMutation();
  const [likeMemory] = useLikeMemoryMutation();
  const [downloadMemory] = useDownloadMemoryMutation();

  /* Memoised so `more` is not rebuilt on every render — it closes over this. */
  const first = useMemo(() => query.data?.items ?? [], [query.data?.items]);
  /* The first page comes from the query and the rest from what we kept, so a
     refetch after an upload replaces the top without losing what was read. */
  const items = [...first, ...pages.flat()];

  const reset = useCallback(() => {
    setPages([]);
    setBefore('');
  }, []);

  const setKind = useCallback(
    (next: string) => {
      reset();
      setKindState(next);
    },
    [reset],
  );

  const setSubEvent = useCallback(
    (next: string) => {
      reset();
      setSubEventState(next);
    },
    [reset],
  );

  const more = useCallback(() => {
    const cursor = query.data?.nextCursor ?? '';
    if (!cursor) return;
    /* Keep what is on screen, then ask for what follows it. */
    setPages((current) => [...current, first]);
    setBefore(cursor);
  }, [query.data?.nextCursor, first]);

  /**
   * Adding one.
   *
   * A clip's length is measured here because the server has no decoder. It is
   * a claim, the server clamps it, and the worst a wrong one does is put the
   * clip in the other tab.
   */
  const add = useCallback(
    async (file: File, reel: boolean) => {
      setSay('');
      setKeepId('');
      let durationSec: number | undefined;
      if (file.type.startsWith('video/')) {
        durationSec = await readSeconds(file).catch(() => undefined);
      }
      try {
        const outcome = await addMemory({
          token,
          file,
          reel,
          ...(subEvent !== 'all' ? { subEventId: subEvent } : {}),
          ...(durationSec !== undefined ? { durationSec } : {}),
        }).unwrap();
        setSay(outcome.message);
        setSayWarn(outcome.status === 'duplicate' || outcome.status === 'flagged');
        setKeepId(outcome.status === 'flagged' ? (outcome.media?.id ?? '') : '');
        if (outcome.status === 'added') reset();
      } catch (error) {
        /* The server's own sentence when it sent one — it is already written
           for a guest — and a plain fallback when it did not. The client
           rejects with a normalised `{ status, message }`, so the sentence is
           on `message`; reading `data.message` would silently discard it. */
        const { message } = (error ?? {}) as { status?: number; message?: string };
        setSay(message || COPY_FAILED);
        setSayWarn(true);
      }
    },
    [addMemory, token, subEvent, reset],
  );

  const keep = useCallback(
    async (mediaId: string) => {
      await keepMemory({ token, mediaId }).unwrap().catch(() => undefined);
      setSay('');
      setKeepId('');
      reset();
    },
    [keepMemory, token, reset],
  );

  const like = useCallback(
    (mediaId: string, on: boolean) => {
      likeMemory({ token, mediaId, on })
        .unwrap()
        .then(() => query.refetch())
        .catch(() => undefined);
    },
    [likeMemory, token, query],
  );

  /**
   * Saving one.
   *
   * The url is asked for rather than linked to, because the permission is the
   * server's answer: a client that draws the button anyway gets a refusal
   * instead of a file.
   */
  const download = useCallback(
    (mediaId: string) => {
      downloadMemory({ token, mediaId })
        .unwrap()
        .then(({ url }) => window.open(url, '_blank', 'noopener,noreferrer'))
        .catch(() => {
          setSay(COPY_NO_DOWNLOAD);
          setSayWarn(true);
        });
    },
    [downloadMemory, token],
  );

  return {
    gallery: query.data,
    items,
    isLoading: query.isLoading,
    busy: query.isFetching || addState.isLoading,
    kind,
    subEvent,
    say,
    sayWarn,
    keepId,
    setKind,
    setSubEvent,
    more,
    add,
    keep,
    like,
    download,
  };
}

const COPY_FAILED = 'That could not be shared. Check the file and try again.';
const COPY_NO_DOWNLOAD = 'The hosts have not enabled downloads for this gallery.';

/** A clip's length, read from the file before it is uploaded. */
function readSeconds(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const probe = document.createElement('video');
    probe.preload = 'metadata';
    probe.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(Math.round(probe.duration) || 0);
    };
    probe.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('unreadable'));
    };
    probe.src = url;
  });
}
