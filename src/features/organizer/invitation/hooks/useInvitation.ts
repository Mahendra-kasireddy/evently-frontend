import { useCallback, useMemo, useState } from 'react';
import {
  useGetInvitationQuery,
  useResolveChangeRequestMutation,
  useSendInvitationMutation,
  useUpdateInvitationMutation,
} from '../service';
import type {
  EditorTarget,
  InvitationBlock,
  InvitationDetails,
  InvitationSubEvent,
  OrganizerInvitation,
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
}

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
  const { data, isLoading, isError, refetch } = useGetInvitationQuery(bookingId, {
    skip: !bookingId,
  });
  const [update, updateState] = useUpdateInvitationMutation();
  const [sendMutation, sendState] = useSendInvitationMutation();
  const [resolveMutation, resolveState] = useResolveChangeRequestMutation();
  const [editor, setEditor] = useState<EditorTarget>(null);

  const blocks = useMemo(() => data?.blocks ?? [], [data]);

  const editingBlock = useMemo(
    () => (editor?.kind === 'block' ? blocks.find((b) => b.key === editor.key) : undefined),
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
      await writeBlocks(blocks.map((b) => (b.key === key ? { ...b, hidden: !b.hidden } : b)));
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
            ? { ...b, title: title || b.title, heading: patch.heading, body: patch.body }
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
    isSaving: updateState.isLoading || sendState.isLoading || resolveState.isLoading,
    saveError: updateState.isError || sendState.isError,

    editor,
    editingBlock,
    openEditor: useCallback((target: NonNullable<EditorTarget>) => setEditor(target), []),
    closeEditor: useCallback(() => setEditor(null), []),

    toggleBlock,
    moveBlock,
    saveBlock,
    removeBlock,
    send,
    resolveRequest,
  };
}
