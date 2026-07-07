/// <reference types="vite/client" />

// Typed view of import.meta.env. The runtime source of truth is the validated,
// frozen object in src/lib/env.ts — prefer importing `env` from there.
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL_DEVELOPMENT: string;
  readonly VITE_API_BASE_URL_QA: string;
  readonly VITE_API_BASE_URL_PRODUCTION: string;
  readonly VITE_APP_NAME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
