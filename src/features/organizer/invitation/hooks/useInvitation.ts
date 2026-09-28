import { useCallback, useMemo, useState } from 'react';
import { artworkOf } from '@features/invitation';
import {
  readVideoSeconds,
  STORY_CAPTION_MAX,
  STORY_MAX_CARDS,
  uploadInvitationArtwork,
  VIDEO_MAX_SECONDS,
} from '../artwork';
import {
  useGetInvitationQuery,
  useResolveChangeRequestMutation,
  useSendInvitationMutation,
  useUpdateInvitationMutation,
} from '../service';
import type { CountdownSettings } from '../sections/CountdownEditor';
import type {
  EditorTarget,
  InvitationBlock,
  InvitationDetails,
  InvitationStoryCard,
  InvitationSubEvent,
  OrganizerInvitation,
  StoryCardInput,
} from '../types';

export interface SaveBlockPatch {
  title: string;
  heading: string;
  body: string;
  /** Event-level fields the section's editor also exposes (header, dates…). */
  details?: Partial<InvitationDetails>;
  /**
   * The Save-the-Date cards, when the section being saved is the one that owns
   * them. Absent means "leave them alone" — sending `[]` would delete them.
   */
  subEvents?: InvitationSubEvent[];
}

export interface UseInvitationResult {
  invitation: OrganizerInvitation | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  isSaving: boolean;
  saveError: boolean;

  editor: EditorTarget;
  editingBlock: InvitationBlock | undefined;
  openEditor: (target: NonNullable<EditorTarget>) => void;
  closeEditor: () => void;

  toggleBlock: (key: string) => Promise<void>;
  /** Reorder: move `key` to `index`, clamped to the list. */
  moveBlock: (key: string, index: number) => Promise<void>;
  saveBlock: (patch: SaveBlockPatch) => Promise<void>;
  removeBlock: (key: string) => Promise<void>;
  send: () => Promise<void>;
  /** Mark one of the customer's change requests as dealt with. */
  resolveRequest: (requestId: string) => Promise<void>;

  /* ---- the invitation artwork ---- */
  isUploading: boolean;
  /** Empty while nothing is wrong; a sentence the organizer can act on. */
  uploadError: string;
  uploadArtwork: (file: File, kind: 'image' | 'video') => Promise<void>;
  removeArtwork: () => Promise<void>;

  /* ---- the story ---- */
  /** The cards as the organizer is arranging them, saved or not yet. */
  storyCards: InvitationStoryCard[];
  storyTitle: string;
  /** True while a story photograph is on its way to storage. */
  isStoryUploading: boolean;
  storyError: string;
  /** Unsaved edits are held here, so a failed save does not lose them. */
  storyDirty: boolean;
  setStoryTitle: (title: string) => void;
  addStoryCard: (file: File) => Promise<void>;
  setStoryCaption: (id: string, caption: string) => void;
  replaceStoryPhoto: (id: string, file: File) => Promise<void>;
  removeStoryCard: (id: string) => void;
  moveStoryCard: (id: string, to: number) => void;
  saveStory: () => Promise<void>;

  /* ---- the Save-the-Date cards ---- */
  /** The cards as the organizer is arranging them, saved or not yet. */
  subEvents: InvitationSubEvent[];
  subEventsDirty: boolean;
  subEventsError: string;
  /** Index of the card whose fields are expanded, or null for none. */
  openSubEvent: number | null;
  setOpenSubEvent: (index: number | null) => void;
  setSubEvents: (cards: InvitationSubEvent[]) => void;
  saveSubEvents: () => Promise<void>;

  /* ---- the countdown ---- */
  countdown: CountdownSettings;
  countdownDirty: boolean;
  countdownError: string;
  setCountdown: (patch: Partial<CountdownSettings>) => void;
  saveCountdown: () => Promise<void>;
}

const COPY_VIDEO_UNREADABLE =
  'We couldn\u2019t read that video\u2019s length, so it can\u2019t be used as the invitation.';
const COPY_UPLOAD_FAILED =
  'That file could not be uploaded. Check the format and size, then try again.';
/*
 * Named precisely, because the two failures need different actions: the file
 * reached storage, and the API refused to record it.
 */
const COPY_COUNTDOWN_SAVE_FAILED =
  'The countdown could not be saved. Your settings are still here — try again.';
const COPY_COUNTDOWN_NOT_STORED =
  'This API version does not store countdown settings yet, so nothing was saved. The backend needs deploying (or restarting, if you are running it locally).';

const COPY_SUB_EVENTS_SAVE_FAILED =
  'The dates could not be saved. Your cards are still here \u2014 try again.';
const COPY_SUB_EVENTS_NOT_STORED =
  'This API version does not store Save-the-Date cards yet, so nothing was saved. The backend needs deploying (or restarting, if you are running it locally).';
/* Named rather than silently dropped: the server hides a nameless card from
   every guest, so saving one looks exactly like saving nothing. */
const COPY_LIVE_NOT_STORED =
  'The cards saved, but this API version does not store a live stream yet, so the stream was not. The backend needs deploying (or restarting, if you are running it locally).';
const COPY_SUB_EVENT_UNNAMED =
  'One card has no name yet. A card without a name is not shown to any guest.';

const COPY_STORY_UPLOAD_FAILED =
  'That photo could not be uploaded. Check the format and size, then try again.';
const COPY_STORY_SAVE_FAILED =
  'The story could not be saved. Your cards are still here — try again.';
const COPY_STORY_NOT_STORED =
  'The photos uploaded, but this API version does not store a story yet, so nothing was saved. The backend needs deploying (or restarting, if you are running it locally).';
const copyCaptionTooLong = (length: number) =>
  `One caption is ${length} characters. The limit is ${STORY_CAPTION_MAX}.`;
const copyTooManyCards = () =>
  `A story can have at most ${STORY_MAX_CARDS} cards.`;

const COPY_NOT_STORED =
  'The file uploaded, but this API version does not store an invitation image or video yet, so nothing was saved. The backend needs deploying (or restarting, if you are running it locally).';
const copyVideoTooLong = (seconds: number) =>
  `That video is ${seconds} seconds. An invitation video can be at most ${VIDEO_MAX_SECONDS}.`;

/** Unique key for a section the organizer adds by hand. */
function customKey(existing: InvitationBlock[]): string {
  let n = existing.length + 1;
  const taken = new Set(existing.map((b) => b.key));
  while (taken.has(`custom-${n}`)) n += 1;
  return `custom-${n}`;
}

/**
 * P-15's data layer. Every mutation writes through to
 * `PATCH /invitation/organizer/:bookingId`, so nothing the organizer changes
 * lives only in the browser — a reload shows exactly what the server holds.
 */
export function useInvitation(bookingId: string): UseInvitationResult {
  const { data, isLoading, isError, refetch } = useGetInvitationQuery(
    bookingId,
    {
      skip: !bookingId,
    },
  );
  const [update, updateState] = useUpdateInvitationMutation();
  const [sendMutation, sendState] = useSendInvitationMutation();
  const [resolveMutation, resolveState] = useResolveChangeRequestMutation();
  const [editor, setEditor] = useState<EditorTarget>(null);
  const [isUploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const blocks = useMemo(() => data?.blocks ?? [], [data]);

  const editingBlock = useMemo(
    () =>
      editor?.kind === 'block'
        ? blocks.find((b) => b.key === editor.key)
        : undefined,
    [editor, blocks],
  );

  const writeBlocks = useCallback(
    async (
      next: InvitationBlock[],
      details?: Partial<InvitationDetails>,
      subEvents?: InvitationSubEvent[],
    ) => {
      if (!bookingId) return;
      // Each key is included only when the caller supplied it: the API replaces
      // whichever arrays it receives, so sending an absent one as `[]` would
      // wipe it.
      await update({
        bookingId,
        body: {
          blocks: next,
          ...(details ? { details } : {}),
          ...(subEvents ? { subEvents } : {}),
        },
      }).unwrap();
    },
    [bookingId, update],
  );

  const toggleBlock = useCallback(
    async (key: string) => {
      await writeBlocks(
        blocks.map((b) => (b.key === key ? { ...b, hidden: !b.hidden } : b)),
      );
    },
    [blocks, writeBlocks],
  );

  const moveBlock = useCallback(
    async (key: string, index: number) => {
      const from = blocks.findIndex((b) => b.key === key);
      const to = Math.max(0, Math.min(blocks.length - 1, index));
      if (from < 0 || from === to) return;
      const next = [...blocks];
      const [moved] = next.splice(from, 1);
      if (!moved) return;
      next.splice(to, 0, moved);
      await writeBlocks(next);
    },
    [blocks, writeBlocks],
  );

  const saveBlock = useCallback(
    async (patch: SaveBlockPatch) => {
      const title = patch.title.trim();
      if (editor?.kind === 'new') {
        const next: InvitationBlock[] = [
          ...blocks,
          {
            key: customKey(blocks),
            title: title || 'New section',
            icon: 'custom',
            owner: 'organizer',
            hidden: false,
            heading: patch.heading,
            body: patch.body,
          },
        ];
        await writeBlocks(next, patch.details, patch.subEvents);
      } else if (editor?.kind === 'block') {
        const next = blocks.map((b) =>
          b.key === editor.key
            ? {
                ...b,
                title: title || b.title,
                heading: patch.heading,
                body: patch.body,
              }
            : b,
        );
        await writeBlocks(next, patch.details, patch.subEvents);
      }
      setEditor(null);
    },
    [blocks, editor, writeBlocks],
  );

  const removeBlock = useCallback(
    async (key: string) => {
      await writeBlocks(blocks.filter((b) => b.key !== key));
      setEditor(null);
    },
    [blocks, writeBlocks],
  );

  /**
   * The finished invitation, uploaded and pointed at.
   *
   * Two steps that must not come apart: the file goes to storage, and then the
   * invitation records where it went. Recording first would leave a url to a
   * file that does not exist, so the save only happens once the upload has.
   */
  const uploadArtwork = useCallback(
    async (file: File, kind: 'image' | 'video') => {
      if (!bookingId) return;
      setUploadError('');
      setUploading(true);
      try {
        let seconds = 0;
        if (kind === 'video') {
          /* A length we cannot read is not a length under the limit, so both
             cases stop here rather than at the server after the upload. */
          try {
            seconds = await readVideoSeconds(file);
          } catch {
            setUploadError(COPY_VIDEO_UNREADABLE);
            return;
          }
          if (seconds > VIDEO_MAX_SECONDS) {
            setUploadError(copyVideoTooLong(seconds));
            return;
          }
        }

        const stored = await uploadInvitationArtwork(file, kind);
        const saved = await update({
          bookingId,
          body: {
            details: {
              heroMediaType: kind,
              heroMediaUrl: stored.url,
              heroMediaKey: stored.key,
              heroMediaDurationSec: seconds,
            },
          },
        }).unwrap();

        /*
         * The save is only a save if the server kept it.
         *
         * The API validates with `whitelist: true`, which silently strips any
         * property its DTO does not declare — so an API that predates the
         * upload answers 200 with the invitation unchanged, and without this
         * check the screen would report success over an empty canvas. Reading
         * back what was written is the only way to tell the two apart.
         */
        if (!artworkOf(saved.details)) {
          setUploadError(COPY_NOT_STORED);
        }
      } catch {
        setUploadError(COPY_UPLOAD_FAILED);
      } finally {
        setUploading(false);
      }
    },
    [bookingId, update],
  );

  /** Clearing it: the customer then sees "being prepared" again, truthfully. */
  const removeArtwork = useCallback(async () => {
    if (!bookingId) return;
    setUploadError('');
    await update({
      bookingId,
      body: {
        details: {
          heroMediaType: '',
          heroMediaUrl: '',
          heroMediaKey: '',
          heroMediaDurationSec: 0,
        },
      },
    }).unwrap();
  }, [bookingId, update]);

  /*
   * The story is edited as a whole and saved as a whole.
   *
   * Held locally while the organizer arranges it — adding a card, fixing a
   * caption and dragging two into place should not be three round trips, and
   * a failed save must not throw away the arrangement. `Save story` is the one
   * write, and it is the same PATCH everything else on this screen uses.
   */
  const [storyDraft, setStoryDraft] = useState<InvitationStoryCard[] | null>(
    null,
  );
  const [titleDraft, setTitleDraft] = useState<string | null>(null);
  const [isStoryUploading, setStoryUploading] = useState(false);
  const [storyError, setStoryError] = useState('');

  const serverCards = useMemo(() => data?.storyCards ?? [], [data]);
  const storyCards = storyDraft ?? serverCards;
  const storyTitle = titleDraft ?? data?.details.storyTitle ?? '';
  const storyDirty = storyDraft !== null || titleDraft !== null;

  const setStoryTitle = useCallback((title: string) => {
    setStoryError('');
    setTitleDraft(title);
  }, []);

  /** Edits work from whatever is on screen, saved or not. */
  const editCards = useCallback(
    (next: (current: InvitationStoryCard[]) => InvitationStoryCard[]) => {
      setStoryError('');
      setStoryDraft((current) => next(current ?? serverCards));
    },
    [serverCards],
  );

  const addStoryCard = useCallback(
    async (file: File) => {
      if (storyCards.length >= STORY_MAX_CARDS) {
        setStoryError(copyTooManyCards());
        return;
      }
      setStoryError('');
      setStoryUploading(true);
      try {
        const stored = await uploadInvitationArtwork(file, 'story');
        editCards((current) => [
          ...current,
          {
            /* A local id until the server assigns one: React needs a stable
               key now, and a card that has never been saved has no other. */
            id: `new-${Date.now()}-${current.length}`,
            imageUrl: stored.url,
            imageKey: stored.key,
            caption: '',
            order: current.length,
          },
        ]);
      } catch {
        setStoryError(COPY_STORY_UPLOAD_FAILED);
      } finally {
        setStoryUploading(false);
      }
    },
    [storyCards.length, editCards],
  );

  const replaceStoryPhoto = useCallback(
    async (id: string, file: File) => {
      setStoryError('');
      setStoryUploading(true);
      try {
        const stored = await uploadInvitationArtwork(file, 'story');
        editCards((current) =>
          current.map((c) =>
            c.id === id
              ? { ...c, imageUrl: stored.url, imageKey: stored.key }
              : c,
          ),
        );
      } catch {
        setStoryError(COPY_STORY_UPLOAD_FAILED);
      } finally {
        setStoryUploading(false);
      }
    },
    [editCards],
  );

  const setStoryCaption = useCallback(
    (id: string, caption: string) => {
      editCards((current) =>
        current.map((c) => (c.id === id ? { ...c, caption } : c)),
      );
    },
    [editCards],
  );

  const removeStoryCard = useCallback(
    (id: string) => {
      editCards((current) => current.filter((c) => c.id !== id));
    },
    [editCards],
  );

  /** Move one card to a position, clamped — the same shape as `moveBlock`. */
  const moveStoryCard = useCallback(
    (id: string, index: number) => {
      editCards((current) => {
        const from = current.findIndex((c) => c.id === id);
        const to = Math.max(0, Math.min(current.length - 1, index));
        if (from < 0 || from === to) return current;
        const next = [...current];
        const [moved] = next.splice(from, 1);
        if (!moved) return current;
        next.splice(to, 0, moved);
        return next;
      });
    },
    [editCards],
  );

  /*
   * The Save-the-Date cards, edited as a list and written as a list.
   *
   * The same shape as the story above, for the same reason: the API replaces
   * the whole array, so a per-field write would publish a half-typed venue to
   * a customer who may be reviewing at that moment.
   */
  const [subEventsDraft, setSubEventsDraft] = useState<
    InvitationSubEvent[] | null
  >(null);
  const [subEventsError, setSubEventsError] = useState('');
  const [openSubEvent, setOpenSubEvent] = useState<number | null>(null);

  const serverSubEvents = useMemo(() => data?.subEvents ?? [], [data]);
  const subEvents = subEventsDraft ?? serverSubEvents;
  const subEventsDirty = subEventsDraft !== null;

  const setSubEvents = useCallback((cards: InvitationSubEvent[]) => {
    setSubEventsError('');
    setSubEventsDraft(cards);
  }, []);

  const saveSubEvents = useCallback(async () => {
    if (!bookingId || !subEventsDraft) return;
    if (subEventsDraft.some((card) => !card.name.trim())) {
      setSubEventsError(COPY_SUB_EVENT_UNNAMED);
      return;
    }
    setSubEventsError('');
    try {
      const saved = await update({
        bookingId,
        body: { subEvents: subEventsDraft },
      }).unwrap();
      /*
       * The same read-back F1 and F2 do: the API strips any property its DTO
       * does not declare, so a version that predates these cards answers 200
       * having saved none of them. Deleting the last card is the one case
       * where an empty answer is the right one.
       */
      if (subEventsDraft.length > 0 && (saved.subEvents ?? []).length === 0) {
        setSubEventsError(COPY_SUB_EVENTS_NOT_STORED);
        return;
      }
      /*
       * And the same question asked again of the live stream, because the
       * cards can save perfectly while the fields inside them are dropped:
       * `whitelist: true` strips per property, not per object, so an API
       * that predates F5 answers 200 with the cards intact and every stream
       * quietly gone. Without this the organizer is told it worked and then
       * finds nothing on air.
       */
      const wantsLive = subEventsDraft.some(
        (c) => c.liveEnabled && (c.liveUrl ?? '').trim() !== '',
      );
      const gotLive = (saved.subEvents ?? []).some(
        (c) => c.liveEnabled && (c.liveUrl ?? '').trim() !== '',
      );
      if (wantsLive && !gotLive) {
        setSubEventsError(COPY_LIVE_NOT_STORED);
        return;
      }
      /* The server’s copy is the truth now — including the ids it assigned,
         which is what the countdown's target list points at. */
      setSubEventsDraft(null);
    } catch {
      /* The cards stay on screen, so nothing typed is lost. */
      setSubEventsError(COPY_SUB_EVENTS_SAVE_FAILED);
    }
  }, [bookingId, subEventsDraft, update]);

  /*
   * The countdown's settings, held while they are being changed.
   *
   * Five fields that belong together — which event, what replaces the timer,
   * and the three that make up the notice — written in one save, because
   * flipping a switch and typing a sentence should not be two round trips.
   */
  const [countdownDraft, setCountdownDraft] =
    useState<Partial<CountdownSettings> | null>(null);
  const [countdownError, setCountdownError] = useState('');

  const savedCountdown: CountdownSettings = useMemo(() => {
    const d = data?.details;
    return {
      countdownSubEventId: d?.countdownSubEventId ?? '',
      postEventMessage: d?.postEventMessage ?? '',
      oneDayNotificationEnabled: d?.oneDayNotificationEnabled ?? true,
      oneDayNotificationMessage: d?.oneDayNotificationMessage ?? '',
      missedNotificationMessage: d?.missedNotificationMessage ?? '',
    };
  }, [data]);

  const countdown: CountdownSettings = {
    ...savedCountdown,
    ...(countdownDraft ?? {}),
  };
  const countdownDirty = countdownDraft !== null;

  const setCountdown = useCallback((patch: Partial<CountdownSettings>) => {
    setCountdownError('');
    setCountdownDraft((current) => ({ ...(current ?? {}), ...patch }));
  }, []);

  const saveCountdown = useCallback(async () => {
    if (!bookingId || !countdownDraft) return;
    setCountdownError('');
    try {
      const saved = await update({
        bookingId,
        body: { details: countdownDraft },
      }).unwrap();
      /*
       * The same read-back F1 and F2 do: the API strips any property its DTO
       * does not declare, so a version that predates the countdown answers 200
       * having saved none of it.
       */
      if (
        countdownDraft.countdownSubEventId !== undefined &&
        (saved.details.countdownSubEventId ?? '') !==
          countdownDraft.countdownSubEventId
      ) {
        setCountdownError(COPY_COUNTDOWN_NOT_STORED);
        return;
      }
      setCountdownDraft(null);
    } catch {
      /* The settings stay on screen, so nothing typed is lost. */
      setCountdownError(COPY_COUNTDOWN_SAVE_FAILED);
    }
  }, [bookingId, countdownDraft, update]);

  const saveStory = useCallback(async () => {
    if (!bookingId) return;
    /*
     * Refused here as well as on the server, and named: a caption the server
     * rejects comes back as a validation error with no card attached to it,
     * which tells the organizer nothing about which line to shorten.
     */
    const tooLong = storyCards.find(
      (c) => c.caption.trim().length > STORY_CAPTION_MAX,
    );
    if (tooLong) {
      setStoryError(copyCaptionTooLong(tooLong.caption.trim().length));
      return;
    }
    if (storyCards.length > STORY_MAX_CARDS) {
      setStoryError(copyTooManyCards());
      return;
    }

    setStoryError('');
    try {
      const body: StoryCardInput[] = storyCards.map((c) => ({
        imageUrl: c.imageUrl,
        ...(c.imageKey ? { imageKey: c.imageKey } : {}),
        caption: c.caption.trim(),
      }));
      const saved = await update({
        bookingId,
        body: {
          storyCards: body,
          ...(titleDraft !== null
            ? { details: { storyTitle: titleDraft.trim() } }
            : {}),
        },
      }).unwrap();

      /*
       * The same read-back F1 does, for the same reason: the API strips any
       * property its DTO does not declare, so a version that predates the
       * story answers 200 having saved none of it.
       */
      if (body.length > 0 && (saved.storyCards ?? []).length === 0) {
        setStoryError(COPY_STORY_NOT_STORED);
        return;
      }
      /* The server's copy is the truth now — including the ids it assigned. */
      setStoryDraft(null);
      setTitleDraft(null);
    } catch {
      /* The arrangement stays on screen, so nothing typed is lost. */
      setStoryError(COPY_STORY_SAVE_FAILED);
    }
  }, [bookingId, storyCards, titleDraft, update]);

  const send = useCallback(async () => {
    if (!bookingId) return;
    await sendMutation(bookingId).unwrap();
  }, [bookingId, sendMutation]);

  const resolveRequest = useCallback(
    async (requestId: string) => {
      if (!bookingId) return;
      await resolveMutation({ bookingId, requestId }).unwrap();
    },
    [bookingId, resolveMutation],
  );

  return {
    invitation: data,
    isLoading,
    isError,
    refetch,
    isSaving:
      updateState.isLoading || sendState.isLoading || resolveState.isLoading,
    saveError: updateState.isError || sendState.isError,

    editor,
    editingBlock,
    openEditor: useCallback(
      (target: NonNullable<EditorTarget>) => setEditor(target),
      [],
    ),
    closeEditor: useCallback(() => setEditor(null), []),

    toggleBlock,
    moveBlock,
    saveBlock,
    removeBlock,
    send,
    resolveRequest,

    isUploading,
    uploadError,
    uploadArtwork,
    removeArtwork,

    storyCards,
    storyTitle,
    isStoryUploading,
    storyError,
    storyDirty,
    setStoryTitle,
    addStoryCard,
    setStoryCaption,
    replaceStoryPhoto,
    removeStoryCard,
    moveStoryCard,
    saveStory,

    subEvents,
    subEventsDirty,
    subEventsError,
    openSubEvent,
    setOpenSubEvent,
    setSubEvents,
    saveSubEvents,

    countdown,
    countdownDirty,
    countdownError,
    setCountdown,
    saveCountdown,
  };
}
