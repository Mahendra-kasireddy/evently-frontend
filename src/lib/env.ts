import { z } from 'zod';

/**
 * Startup environment validation + per-mode URL selection.
 *
 * All three stage backend URLs live together in a single committed `.env`
 * file. This module reads them, validates every one, and picks the URL that
 * matches the active build mode (development | qa | production).
 *
 * SECURITY: Only VITE_-prefixed vars are exposed to the client bundle, and
 * everything here ships to the browser in plaintext. These are API hostnames,
 * not secrets. NEVER read a real secret through this module.
 *
 * Any missing or malformed variable throws immediately at import time, so the
 * app fails loudly at startup instead of misbehaving deep in a request.
 */
const envSchema = z.object({
  VITE_API_BASE_URL_DEVELOPMENT: z
    .string({ required_error: 'VITE_API_BASE_URL_DEVELOPMENT is required' })
    .url('VITE_API_BASE_URL_DEVELOPMENT must be a valid URL'),
  VITE_API_BASE_URL_QA: z
    .string({ required_error: 'VITE_API_BASE_URL_QA is required' })
    .url('VITE_API_BASE_URL_QA must be a valid URL'),
  VITE_API_BASE_URL_PRODUCTION: z
    .string({ required_error: 'VITE_API_BASE_URL_PRODUCTION is required' })
    .url('VITE_API_BASE_URL_PRODUCTION must be a valid URL'),
  VITE_APP_NAME: z.string().min(1).default('Evently'),
});

const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
    .join('\n');
  // Throwing here halts module evaluation -> the app never boots with bad env.
  throw new Error(`Invalid environment variables. Check your .env file:\n${issues}`);
}

// Pick the backend URL for the active mode. `npm run dev` => 'development',
// `build:qa` => 'qa', `build:prod` => 'production'.
const URL_BY_MODE: Record<string, string> = {
  development: parsed.data.VITE_API_BASE_URL_DEVELOPMENT,
  qa: parsed.data.VITE_API_BASE_URL_QA,
  production: parsed.data.VITE_API_BASE_URL_PRODUCTION,
};

const apiBaseUrl =
  URL_BY_MODE[import.meta.env.MODE] ?? parsed.data.VITE_API_BASE_URL_DEVELOPMENT;

/** Typed, frozen, validated runtime config. Import this — never import.meta.env. */
export const env = Object.freeze({
  apiBaseUrl,
  appName: parsed.data.VITE_APP_NAME,
  // Devtools on everywhere except production builds.
  enableDevtools: import.meta.env.MODE !== 'production',
  mode: import.meta.env.MODE,
  isProd: import.meta.env.PROD,
} as const);

export type Env = typeof env;
