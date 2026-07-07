import axios, { type AxiosInstance } from 'axios';
import { env } from '@lib/env';
import { getToken, setToken } from './token';
import { normalizeError } from './errors';

/**
 * THE single axios instance for the whole app.
 *
 * Rule (enforced by convention + README): no feature may create its own axios
 * instance or call `fetch` directly. All HTTP goes through this client, wrapped
 * by TanStack Query hooks. baseURL comes from validated env — never hardcoded.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

// --- Request interceptor: attach bearer token if present -------------------
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

// --- Response interceptor: normalize every error ---------------------------
apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const normalized = normalizeError(error);

    // Token rejected/expired: clear it so the app drops to unauthenticated.
    // Route-level redirect is handled by the router guard, not here.
    if (normalized.status === 401) {
      setToken(null);
    }

    // Reject with the normalized shape so query hooks get a predictable error.
    return Promise.reject(normalized);
  },
);
