import { AxiosError } from 'axios';

/**
 * Normalized error shape that every consumer (query hooks, UI) can rely on,
 * regardless of whether the failure came from the network, the server, or a
 * thrown client exception.
 */
export interface NormalizedApiError {
  /** HTTP status, or 0 for network/timeout/unknown failures. */
  status: number;
  /** Stable machine code for branching (e.g. 'UNAUTHORIZED', 'NETWORK'). */
  code: string;
  /** Human-readable message safe to surface in the UI. */
  message: string;
  /** Raw server payload, when present. */
  details?: unknown;
}

/** Shape we expect (best-effort) from the backend error envelope. */
interface ServerErrorBody {
  code?: string;
  message?: string;
  [key: string]: unknown;
}

const STATUS_CODE: Record<number, string> = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  422: 'VALIDATION',
  429: 'RATE_LIMITED',
  500: 'SERVER_ERROR',
};

export function normalizeError(error: unknown): NormalizedApiError {
  if (error instanceof AxiosError) {
    if (error.response) {
      const status = error.response.status;
      const body = error.response.data as ServerErrorBody | undefined;
      return {
        status,
        code: body?.code ?? STATUS_CODE[status] ?? 'HTTP_ERROR',
        message:
          body?.message ?? error.message ?? 'The request failed unexpectedly.',
        details: body,
      };
    }
    // No response: timeout, DNS, CORS, offline, aborted.
    return {
      status: 0,
      code: error.code === 'ECONNABORTED' ? 'TIMEOUT' : 'NETWORK',
      message: 'Could not reach the server. Check your connection and retry.',
    };
  }

  if (error instanceof Error) {
    return { status: 0, code: 'CLIENT', message: error.message };
  }

  return { status: 0, code: 'UNKNOWN', message: 'An unknown error occurred.' };
}

/** Type guard for consumers that catch `unknown`. */
export function isNormalizedApiError(e: unknown): e is NormalizedApiError {
  return (
    typeof e === 'object' &&
    e !== null &&
    'status' in e &&
    'code' in e &&
    'message' in e
  );
}
