import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';
import { env } from '@lib/env';
import { getRefreshToken, getToken, setSession } from './token';
import { normalizeError } from './errors';
import { postToApp } from '@lib/native';

/**
 * How long one request may take.
 *
 * 60 s, not 15: the API runs on a host that sleeps when idle and takes up to
 * ~50 s to wake. At 15 s the first request after a quiet spell always timed
 * out and the page said "Could not reach the server" — on the web and inside
 * the mobile app's dashboard alike.
 */
const REQUEST_TIMEOUT_MS = 60_000;

/**
 * THE single axios instance for the whole app.
 *
 * Rule (enforced by convention + README): no feature may create its own axios
 * instance or call `fetch` directly. All HTTP goes through this client, wrapped
 * by TanStack Query hooks. baseURL comes from validated env — never hardcoded.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: REQUEST_TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
});

/*
 * A separate instance for the refresh call itself, with no interceptors: if
 * the refresh went through apiClient, a refresh that 401s would try to
 * refresh again.
 */
const refreshClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: REQUEST_TIMEOUT_MS,
});

/** The refresh endpoint names the new access token `accessToken` (sign-in calls it `token`). */
interface RefreshResponse {
  accessToken?: string;
  token?: string;
  refreshToken?: string;
}

/**
 * One refresh at a time. Several requests can 401 together when the access
 * token runs out; the refresh token rotates on every use, so only the first
 * refresh would succeed — the rest wait for it instead.
 */
let inFlight: Promise<string | null> | null = null;

function refreshSession(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return Promise.resolve(null);
  if (inFlight) return inFlight;
  inFlight = refreshClient
    .post<RefreshResponse>('/auth/refreshToken', null, {
      headers: { Authorization: `Bearer ${refreshToken}` },
    })
    .then(({ data }) => {
      const token = data?.accessToken ?? data?.token;
      if (!token) return null;
      setSession(token, data.refreshToken ?? refreshToken);
      return token;
    })
    .catch((err: unknown) => {
      // Only the server saying no ends the session. A network blip keeps the
      // refresh token, so the next request can try again.
      const status = (err as { response?: { status?: number } })?.response
        ?.status;
      if (status === 401 || status === 403) setSession(null);
      return null;
    })
    .finally(() => {
      inFlight = null;
    });
  return inFlight;
}

// --- Request interceptor: attach bearer token if present -------------------
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

// --- Response interceptor: renew an expired session, normalize errors ------
apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    const normalized = normalizeError(error);
    const original = (error as { config?: RetriableConfig })?.config;

    if (normalized.status === 401) {
      // Inside the mobile app the app holds the session: hand the expiry to
      // it (it refreshes and reloads this page) instead of handling it here.
      if (postToApp({ type: 'sessionExpired' }))
        return Promise.reject(normalized);

      // In a browser: renew the 1-hour access token once and retry. Without
      // this the web app signed people out an hour after every sign-in.
      if (original && !original._retried) {
        original._retried = true;
        const token = await refreshSession();
        if (token) {
          original.headers.set('Authorization', `Bearer ${token}`);
          return apiClient(original);
        }
      }
      // Signed out for real only when there is no refresh token left — none
      // was stored, or the server refused it (refreshSession cleared it). A
      // refresh that failed on the network keeps it, so the next request
      // tries again instead of logging the organizer out over a blip.
      if (!getRefreshToken()) setSession(null);
    }

    // Reject with the normalized shape so query hooks get a predictable error.
    return Promise.reject(normalized);
  },
);
