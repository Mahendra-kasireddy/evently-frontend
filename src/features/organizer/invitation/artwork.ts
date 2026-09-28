import type { AxiosRequestConfig } from 'axios';
import { apiClient } from '@lib/api';

/**
 * Where the invitation's artwork is stored.
 *
 * Through the platform's one upload endpoint, under the purposes it already
 * defines — an image is a cover image, a video is a video. Nothing about the
 * invitation needs its own upload route or its own storage.
 */
const IMAGE_PURPOSE = 'coverImage';
const VIDEO_PURPOSE = 'video';
/** A story photograph is one of a set, which is what `gallery` already means. */
const STORY_PURPOSE = 'gallery';

/** What the server will accept, so the file picker refuses the rest first. */
export const IMAGE_TYPES = 'image/jpeg,image/png,image/webp';
export const VIDEO_TYPES = 'video/mp4,video/webm,video/quicktime';

/**
 * How long an uploaded video may run, in seconds.
 *
 * Mirrors the server's own cap; checked here so a two-minute-plus file is
 * refused before it is uploaded rather than after.
 */
export const VIDEO_MAX_SECONDS = 120;

/**
 * The story's own limits, mirroring the server's.
 *
 * Checked here so the organizer is told which caption to shorten while they
 * are looking at it — the server checks them too, and its answer is the one
 * that decides.
 */
export const STORY_MAX_CARDS = 12;
export const STORY_CAPTION_MAX = 120;

/** The cap the post-event and notification messages share with the server. */
export const NOTIFICATION_MESSAGE_MAX = 400;

export interface UploadedArtwork {
  url: string;
  key: string;
}

/**
 * A video's length, read from the file itself.
 *
 * The browser is the only thing here that can measure it, and a length we do
 * not have is not a length under the limit — so a file whose metadata will not
 * load is rejected rather than uploaded on trust.
 */
export function readVideoSeconds(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const probe = document.createElement('video');
    probe.preload = 'metadata';
    probe.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      const seconds = Math.round(probe.duration);
      if (!Number.isFinite(seconds) || seconds <= 0) {
        reject(new Error('unreadable'));
        return;
      }
      resolve(seconds);
    };
    probe.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('unreadable'));
    };
    probe.src = url;
  });
}

/**
 * Push the finished invitation through the shared `/upload` endpoint.
 *
 * The invitation records the stored URL and key it returns; the file bytes
 * never belong to this feature. Uploading before saving means the invitation
 * is only ever pointed at artwork that already exists on the server.
 */
export async function uploadInvitationArtwork(
  file: File,
  kind: 'image' | 'video' | 'story',
): Promise<UploadedArtwork> {
  const form = new FormData();
  form.append('file', file);
  form.append(
    'purpose',
    kind === 'video'
      ? VIDEO_PURPOSE
      : kind === 'story'
        ? STORY_PURPOSE
        : IMAGE_PURPOSE,
  );
  // Letting the browser set the multipart boundary — axios would otherwise
  // keep the JSON content type the client is configured with.
  const config = {
    headers: { 'Content-Type': undefined },
  } as unknown as AxiosRequestConfig;
  const { data } = await apiClient.post<{ url: string; key: string }>(
    '/upload',
    form,
    config,
  );
  return { url: data.url, key: data.key };
}
