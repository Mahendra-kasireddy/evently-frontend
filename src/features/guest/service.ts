import type { AxiosRequestConfig } from 'axios';
import { apiClient } from '@lib/api';
import { baseApi, toQueryResult } from '@lib/rtk';
import type {
  CardColour,
  GuestCountdown,
  GuestLive,
  GuestNotification,
  InvitationBlock,
  InvitationDetails,
  InvitationStoryCard,
  InvitationSubEvent,
  InvitationTemplate,
} from '@features/invitation';

/**
 * The published invitation, as a guest holding a share link sees it.
 *
 * A deliberately smaller shape than `Invitation`: no status, no change
 * requests, no ownership, no booking id. The server builds this payload
 * separately for the same reason — a field added to the customer's view later
 * must not become guest-visible by accident.
 */
export interface GuestInvitation {
  guest: { name: string };
  bookingTitle: string;
  occasion: string;
  details: InvitationDetails;
  /** Already filtered: hidden sections never reach a guest. */
  blocks: InvitationBlock[];
  subEvents: InvitationSubEvent[];
  /** The story, in order. Never carries the storage handles. */
  storyCards: InvitationStoryCard[];
  templates: InvitationTemplate[];
  cardPalette: CardColour[];
  defaultSubEventMinutes: number;
  /** What the countdown counts down to. Absent when no date is set anywhere. */
  countdown?: GuestCountdown | null;
  /** Whether to raise a notice with this guest — day-before, or live. */
  notification?: GuestNotification;
  /**
   * The stream this guest may watch, or null.
   *
   * Null covers both "nothing is streaming" and "this guest is not invited to
   * the event that is" — deliberately indistinguishable from out here.
   */
  live?: GuestLive | null;
  /**
   * Whether the gallery exists for this guest, and whether they may read it.
   * Absent on an invitation created before the feature, which reads as off.
   */
  memories?: { enabled: boolean; guestView: boolean; guestUpload: boolean };
}

/* ---------------------------------------------------------- shared memories */

export type MemoryKind = 'photo' | 'video' | 'reel';

/** One item in the gallery, as a guest reads it. Never carries a storage key. */
export interface GuestMemory {
  id: string;
  kind: MemoryKind;
  subEvent: string;
  /**
   * The original. Present for the download flow only — the grid and the
   * viewer both read a smaller rendition, so a gallery never pulls originals.
   */
  url: string;
  /** The grid's rendition; falls back down the chain when none was made. */
  thumbnailUrl: string;
  /** The full-screen rendition; falls back to the original. */
  displayUrl: string;
  caption: string;
  durationSec: number;
  likes: number;
  likedByMe: boolean;
  /** Whether this guest uploaded it — what lets them see it in any state. */
  mine: boolean;
  /** Only ever populated on their own: `blurry`, `dark`, `duplicate`. */
  flags: string[];
  state: string;
  createdAt: string;
}

export interface GuestGallery {
  items: GuestMemory[];
  /** Empty when there is no further page. */
  nextCursor: string;
  counts: { all: number; photo: number; video: number; reel: number };
  subEvents: Array<{ id: string; name: string }>;
  canUpload: boolean;
  canDownload: boolean;
  window: { open: boolean; reason: string; opensAt: string; closesAt: string };
}

export interface GalleryArgs {
  token: string;
  kind?: string;
  subEvent?: string;
  before?: string;
}

/** One item plus the two beside it, resolved server-side. */
export interface GuestMemoryItem extends GuestMemory {
  previousId: string;
  nextId: string;
  canDownload: boolean;
}

export interface UploadOutcome {
  status: 'added' | 'pending' | 'duplicate' | 'flagged';
  message: string;
  media?: GuestMemory;
}

export const guestInvitationApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /**
     * No auth header is needed and none is required — the token in the path is
     * the credential. The shared axios client attaches a bearer token when the
     * viewer happens to be signed in, which the endpoint simply ignores.
     */
    /**
     * A guest saying they have read the day-before notice.
     *
     * The token is the whole request — which guest, which invitation and which
     * event are all resolved from it on the server, so nothing about this call
     * can reach another guest's record. Recorded there rather than in the
     * browser, because the dismissal has to survive a new browser and a
     * different device.
     */
    dismissGuestNotification: build.mutation<
      { dismissed: true },
      { token: string; kind?: string }
    >({
      queryFn: ({ token, kind }) =>
        toQueryResult(
          async () =>
            (
              await apiClient.post<{ dismissed: true }>(
                `/invitation/shared/${encodeURIComponent(token)}/notification/dismiss`,
                /* Which notice, never which event: the server resolves what it
                   was about from the token. */
                kind ? { kind } : {},
              )
            ).data,
        ),
    }),
    /**
     * A guest saying they still have the stream open, and being told how many
     * others do.
     *
     * A heartbeat and not a socket. The token is the whole request: which
     * event is being watched, and whether this guest may watch it, are both
     * resolved on the server — and the answer is a count, never a list, so
     * one guest cannot learn who else is there.
     */
    pingGuestLive: build.mutation<{ watching: number; live: boolean }, string>({
      queryFn: (token) =>
        toQueryResult(
          async () =>
            (
              await apiClient.post<{ watching: number; live: boolean }>(
                `/invitation/shared/${encodeURIComponent(token)}/live/ping`,
              )
            ).data,
        ),
    }),
    /**
     * The gallery page.
     *
     * The tab and the celebration are sent as a query and decided again on the
     * server — what reaches this client is already only what this guest may
     * see, so nothing here filters anything.
     */
    getMemories: build.query<GuestGallery, GalleryArgs>({
      queryFn: async ({ token, kind, subEvent, before }) =>
        toQueryResult(async () => {
          const params = new URLSearchParams();
          if (kind && kind !== 'all') params.set('kind', kind);
          if (subEvent && subEvent !== 'all') params.set('subEvent', subEvent);
          if (before) params.set('before', before);
          const query = params.toString();
          return (
            await apiClient.get<GuestGallery>(
              `/invitation/shared/${encodeURIComponent(token)}/memories${query ? `?${query}` : ''}`,
            )
          ).data;
        }),
      providesTags: ['GuestMemories'],
    }),

    getMemory: build.query<GuestMemoryItem, { token: string; mediaId: string }>({
      queryFn: async ({ token, mediaId }) =>
        toQueryResult(
          async () =>
            (
              await apiClient.get<GuestMemoryItem>(
                `/invitation/shared/${encodeURIComponent(token)}/memories/${encodeURIComponent(mediaId)}`,
              )
            ).data,
        ),
    }),

    /**
     * Adding a memory.
     *
     * Multipart, through the same axios client everything else uses. The
     * duration is measured here because the server has no decoder — it is a
     * claim, and the server clamps it.
     */
    addMemory: build.mutation<
      UploadOutcome,
      {
        token: string;
        file: File;
        subEventId?: string;
        caption?: string;
        durationSec?: number;
        reel?: boolean;
      }
    >({
      queryFn: async ({ token, file, subEventId, caption, durationSec, reel }) =>
        toQueryResult(async () => {
          const body = new FormData();
          body.append('file', file);
          if (subEventId) body.append('subEventId', subEventId);
          if (caption) body.append('caption', caption);
          if (durationSec !== undefined) body.append('durationSec', String(durationSec));
          if (reel) body.append('reel', 'true');
          /* Letting the browser set the multipart boundary. The shared
             client is configured with a JSON content type, which axios would
             otherwise keep — and a multipart body with no boundary reaches the
             server as no file at all. Same override as the artwork upload. */
          const config = { headers: { 'Content-Type': undefined } } as unknown as AxiosRequestConfig;
          return (
            await apiClient.post<UploadOutcome>(
              `/invitation/shared/${encodeURIComponent(token)}/memories`,
              body,
              config,
            )
          ).data;
        }),
      invalidatesTags: ['GuestMemories'],
    }),

    /** The uploader saying a flagged photograph of theirs is fine as it is. */
    keepMemory: build.mutation<GuestMemory, { token: string; mediaId: string }>({
      queryFn: async ({ token, mediaId }) =>
        toQueryResult(
          async () =>
            (
              await apiClient.post<GuestMemory>(
                `/invitation/shared/${encodeURIComponent(token)}/memories/${encodeURIComponent(mediaId)}/keep`,
              )
            ).data,
        ),
      invalidatesTags: ['GuestMemories'],
    }),

    likeMemory: build.mutation<GuestMemory, { token: string; mediaId: string; on: boolean }>({
      queryFn: async ({ token, mediaId, on }) =>
        toQueryResult(async () => {
          const url = `/invitation/shared/${encodeURIComponent(token)}/memories/${encodeURIComponent(mediaId)}/like`;
          return on
            ? (await apiClient.post<GuestMemory>(url)).data
            : (await apiClient.delete<GuestMemory>(url)).data;
        }),
    }),

    /**
     * A download, which the server only answers when the customer allowed one.
     * Asked for rather than linked, so the permission is enforced where it is
     * decided instead of by whether a button was drawn.
     */
    downloadMemory: build.mutation<
      { url: string; fileName: string },
      { token: string; mediaId: string }
    >({
      queryFn: async ({ token, mediaId }) =>
        toQueryResult(
          async () =>
            (
              await apiClient.get<{ url: string; fileName: string }>(
                `/invitation/shared/${encodeURIComponent(token)}/memories/${encodeURIComponent(mediaId)}/download`,
              )
            ).data,
        ),
    }),

    getSharedInvitation: build.query<GuestInvitation, string>({
      queryFn: (token) =>
        toQueryResult(
          async () =>
            (
              await apiClient.get<GuestInvitation>(
                `/invitation/shared/${encodeURIComponent(token)}`,
              )
            ).data,
        ),
    }),
  }),
});

export const {
  useGetSharedInvitationQuery,
  useDismissGuestNotificationMutation,
  usePingGuestLiveMutation,
  useGetMemoriesQuery,
  useGetMemoryQuery,
  useAddMemoryMutation,
  useKeepMemoryMutation,
  useLikeMemoryMutation,
  useDownloadMemoryMutation,
} = guestInvitationApi;
