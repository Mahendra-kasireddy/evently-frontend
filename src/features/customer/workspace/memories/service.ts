import { apiClient } from '@lib/api';
import { baseApi, toQueryResult } from '@lib/rtk';

/**
 * Shared Memories, as the customer who owns the celebration manages it.
 *
 * Every endpoint here is one the guest side already relies on, reached from
 * the `mine/:bookingId` prefix rather than the guest's token prefix — there is
 * no organizer equivalent of any of them, and there is deliberately no route
 * to add one to.
 */

export interface MemorySettings {
  enabled: boolean;
  guestUpload: boolean;
  guestView: boolean;
  guestDownload: boolean;
  moderation: boolean;
  /** `yyyy-mm-dd`, or '' to open as soon as the feature is on. */
  uploadFrom: string;
  uploadWindowDays: number;
  window: { open: boolean; reason: string; opensAt: string; closesAt: string };
}

/** One item, as its owner reads it — with the reasons a guest never sees. */
export interface ManagedMemory {
  id: string;
  kind: 'photo' | 'video' | 'reel';
  subEvent: string;
  url: string;
  thumbnailUrl: string;
  displayUrl: string;
  caption: string;
  durationSec: number;
  likes: number;
  uploader: string;
  status: string;
  moderationStatus: string;
  visibility: string;
  flags: string[];
  renditionStatus: string;
  createdAt: string;
}

export interface ManagedGallery {
  items: ManagedMemory[];
  nextCursor: string;
  counts: { all: number; photo: number; video: number; reel: number };
  /** How many are waiting, so the tab can carry a badge. */
  awaiting: number;
  subEvents: Array<{ id: string; name: string }>;
}

const base = (bookingId: string) =>
  `/invitation/mine/${encodeURIComponent(bookingId)}/memories`;

export const customerMemoriesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMemorySettings: build.query<MemorySettings, string>({
      queryFn: (bookingId) =>
        toQueryResult(
          async () => (await apiClient.get<MemorySettings>(`${base(bookingId)}/settings`)).data,
        ),
      providesTags: ['MemorySettings'],
    }),

    /**
     * Saving one switch at a time.
     *
     * A partial patch rather than the whole object, so two tabs open on the
     * same event cannot have one of them write back a stale copy of the
     * others' settings.
     */
    saveMemorySettings: build.mutation<
      MemorySettings,
      { bookingId: string; patch: Partial<Omit<MemorySettings, 'window'>> }
    >({
      queryFn: ({ bookingId, patch }) =>
        toQueryResult(
          async () =>
            (await apiClient.patch<MemorySettings>(`${base(bookingId)}/settings`, patch)).data,
        ),
      /* The guest gallery reads these too, so its cache goes with them. */
      invalidatesTags: ['MemorySettings', 'GuestMemories'],
    }),

    getManagedMemories: build.query<
      ManagedGallery,
      { bookingId: string; kind?: string; subEvent?: string; before?: string }
    >({
      queryFn: ({ bookingId, kind, subEvent, before }) =>
        toQueryResult(async () => {
          const params = new URLSearchParams();
          if (kind && kind !== 'all') params.set('kind', kind);
          if (subEvent && subEvent !== 'all') params.set('subEvent', subEvent);
          if (before) params.set('before', before);
          const query = params.toString();
          return (
            await apiClient.get<ManagedGallery>(
              `${base(bookingId)}${query ? `?${query}` : ''}`,
            )
          ).data;
        }),
      providesTags: ['ManagedMemories'],
    }),

    getAwaitingMemories: build.query<ManagedMemory[], string>({
      queryFn: (bookingId) =>
        toQueryResult(
          async () => (await apiClient.get<ManagedMemory[]>(`${base(bookingId)}/awaiting`)).data,
        ),
      providesTags: ['ManagedMemories'],
    }),

    /**
     * Approve, reject, hide and show: one mutation, because they are the same
     * request with a different verb in the path and the same four caches to
     * invalidate. Four near-identical definitions would be four places to
     * forget one of them.
     */
    actOnMemory: build.mutation<
      ManagedMemory,
      { bookingId: string; mediaId: string; action: 'approve' | 'reject' | 'hide' | 'show' }
    >({
      queryFn: ({ bookingId, mediaId, action }) =>
        toQueryResult(
          async () =>
            (
              await apiClient.post<ManagedMemory>(
                `${base(bookingId)}/${encodeURIComponent(mediaId)}/${action}`,
              )
            ).data,
        ),
      invalidatesTags: ['ManagedMemories', 'GuestMemories'],
    }),

    /** Permanent, and takes the original and both renditions with it. */
    deleteMemory: build.mutation<{ removed: true }, { bookingId: string; mediaId: string }>({
      queryFn: ({ bookingId, mediaId }) =>
        toQueryResult(
          async () =>
            (
              await apiClient.delete<{ removed: true }>(
                `${base(bookingId)}/${encodeURIComponent(mediaId)}`,
              )
            ).data,
        ),
      invalidatesTags: ['ManagedMemories', 'GuestMemories'],
    }),
  }),
});

export const {
  useGetMemorySettingsQuery,
  useSaveMemorySettingsMutation,
  useGetManagedMemoriesQuery,
  useGetAwaitingMemoriesQuery,
  useActOnMemoryMutation,
  useDeleteMemoryMutation,
} = customerMemoriesApi;
