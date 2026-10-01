import type { AxiosRequestConfig } from 'axios';
import { apiClient } from '@lib/api';

/**
 * A public event's cover image.
 *
 * Through the platform's one `/upload` endpoint, under the `coverImage`
 * purpose it already defines — the same route the invitation builder uses.
 * Public events get no upload route, no bucket and no image pipeline of their
 * own; this records where the shared one put the file.
 */
const COVER_PURPOSE = 'coverImage';

/** What the server accepts, so the picker refuses the rest before a round trip. */
export const COVER_TYPES = 'image/jpeg,image/png,image/webp';

/** Mirrors the server's cap. Checked here so the organizer hears it sooner. */
export const COVER_MAX_BYTES = 8 * 1024 * 1024;

export async function uploadEventCover(file: File): Promise<{ url: string; key: string }> {
  if (file.size > COVER_MAX_BYTES) {
    throw new Error('That image is larger than 8MB. Try a smaller one.');
  }

  const form = new FormData();
  form.append('file', file);
  form.append('purpose', COVER_PURPOSE);

  /*
   * The client is configured to send JSON, and a multipart body with that
   * content type has no boundary — the server then reads no file at all and
   * answers "no file provided". Clearing it lets the browser write its own.
   */
  const config = { headers: { 'Content-Type': undefined } } as unknown as AxiosRequestConfig;
  const { data } = await apiClient.post<{ url: string; key: string }>('/upload', form, config);
  return { url: data.url, key: data.key };
}
