import type { AxiosRequestConfig } from 'axios';
import { apiClient } from '@lib/api';
import type { IdeaImage } from './types';

/** Server-side purpose for a board photo; governs the size and type rules. */
const IDEA_IMAGE_PURPOSE = 'ideaImage';

/**
 * Push one reference photo through the shared `/upload` endpoint and return the
 * metadata a post stores. The board never holds file bytes itself — a post
 * records the stored URL and key, which is what makes an attachment survive a
 * reload.
 */
export async function uploadIdeaImage(file: File): Promise<IdeaImage> {
  const form = new FormData();
  form.append('file', file);
  form.append('purpose', IDEA_IMAGE_PURPOSE);
  // Letting the browser set the multipart boundary — axios would otherwise
  // keep the JSON content type the client is configured with.
  const config = { headers: { 'Content-Type': undefined } } as unknown as AxiosRequestConfig;
  const { data } = await apiClient.post<{ url: string; key: string; originalName?: string }>(
    '/upload',
    form,
    config,
  );
  return {
    url: data.url,
    key: data.key,
    originalName: data.originalName ?? file.name,
  };
}
