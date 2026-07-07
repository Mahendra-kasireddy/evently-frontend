# Evently Web

Production-grade React + Vite + TypeScript front end. Strict TypeScript,
React Router v6 (per-feature code-splitting), TanStack Query for server state,
React Context + `useReducer` for client state, a single axios instance with
validated env, and Tailwind + CSS Modules for styling.

> Stack note: this project runs on **React 19** (the version already set up
> here), not React 18. Every library used (Router v6, TanStack Query v5, axios,
> zod) is compatible with React 19, so the architecture is unchanged.

## Quick start

```bash
npm install
npm run dev          # uses .env (+ .env.local overrides)
```

| Script               | What it does                                            |
| -------------------- | ------------------------------------------------------- |
| `npm run dev`        | Dev server (mode: `development`)                        |
| `npm run build:qa`   | `vite build --mode qa` → uses the QA URL from `.env`     |
| `npm run build:prod` | `vite build --mode production` → uses the prod URL       |
| `npm run build`      | Alias for the production build                          |
| `npm run preview`    | Serve the built `dist/` locally                         |
| `npm run lint`       | ESLint                                                  |
| `npm run typecheck`  | `tsc -b --noEmit`                                       |
| `npm run format`     | Prettier write                                          |

## Environment config

All three stage backend URLs live in a **single committed `.env` file**, under
three distinct keys. `src/lib/env.ts` reads them, validates every one, and
selects the URL matching the active build mode:

```
VITE_API_BASE_URL_DEVELOPMENT=http://localhost:4000
VITE_API_BASE_URL_QA=https://qa-api.evently.example.com
VITE_API_BASE_URL_PRODUCTION=https://api.evently.example.com
VITE_APP_NAME=Evently
```

| Mode          | Triggered by         | URL key selected                |
| ------------- | -------------------- | ------------------------------- |
| `development` | `npm run dev`        | `VITE_API_BASE_URL_DEVELOPMENT` |
| `qa`          | `npm run build:qa`   | `VITE_API_BASE_URL_QA`          |
| `production`  | `npm run build:prod` | `VITE_API_BASE_URL_PRODUCTION`  |

**Trade-off, stated plainly:** because all three keys are `VITE_`-prefixed,
**all three URLs are included in every bundle** — production JS contains the dev
and QA hostnames too. That's acceptable here because they're API hostnames, not
secrets. If you ever need a stage URL to *not* appear in other stages' bundles,
switch back to per-mode files (`.env.qa` / `.env.production`) so Vite only
embeds the active one. (Want a personal local override without editing `.env`?
Add a gitignored `.env.local` — it's loaded in every mode.)

Rules:

- **Every client var is `VITE_`-prefixed.** Only those reach the browser bundle.
- **Mode selection happens in `env.ts`,** not by reading `import.meta.env`
  directly anywhere else.
- **Never put secrets in `VITE_` vars.** They are embedded in the public bundle
  in plaintext and are trivially extractable. API keys, signing secrets, and DB
  credentials belong on the server. This is commented at the top of `.env`.
- **Validation at startup.** `src/lib/env.ts` parses `import.meta.env` with zod and
  exports a typed, frozen `env` object. A missing or malformed var **throws
  immediately** — the app never boots in a half-configured state. Import `env`
  from `@lib/env`; do not read `import.meta.env` directly elsewhere.

## Folder architecture

```
src/
  app/            Provider tree, router, root + per-route ErrorBoundary, auth (client state)
  lib/            3rd-party-facing infra — api client, env validation. NOT pure helpers.
    api/          THE single axios instance + interceptors + error normalization
    env.ts        zod-validated, frozen runtime config
  utils/          Pure, dependency-free helpers (e.g. cn)
  shared/
    reusable/     Stateless primitives (Button, Input) — props in, callbacks out
    components/   Composed / stateful shared widgets (kept separate from reusable/)
  features/
    <module>/<feature>/
      page.tsx        Entry + thin shell, layout only, NO business logic
                      (default-exported; the router lazy-imports this file)
      container.tsx   Orchestration: runs the hook, passes data down as props
      Component.tsx   Entire assembled UI; props in, feeds the pieces
      sections/       Feature-scoped UI pieces (one folder per piece)
        LoginForm/
          LoginForm.tsx        Pure piece — props in / callbacks out
          LoginForm.module.css Section-specific styles (co-located)
          index.ts             Barrel
        index.ts               sections barrel
      hooks/          Feature hooks, one per logic concern + barrel
        useLogin.ts     TanStack Query hook (wraps the service)
        index.ts        Barrel
      service.ts      Data-access layer: apiClient calls + zod validation, no React
      types.ts        Types + zod schemas (incl. response validation)
      constants.ts    Static values, endpoints, query keys
      styles.module.css  COMMON styles shared across the feature's sections
```

Path aliases (`@app`, `@features`, `@shared`, `@lib`, `@utils`) are defined in
`tsconfig.app.json` and mirrored in `vite.config.ts`. Keep the two in sync.

### `lib` vs `utils`

- `lib/` wraps the outside world: the API client, env, third-party SDK config.
  It has side effects and dependencies.
- `utils/` is pure functions with no app/IO coupling. If it imports axios or
  reads env, it belongs in `lib`, not `utils`.

### `shared/reusable` vs `shared/components`

- `shared/reusable` — stateless primitives. No store, no data, no app imports. Safe to
  reuse anywhere and easy to test (`Button`, `Input`).
- `shared/components` — composed or stateful widgets that may own local state or
  glue primitives together (`Modal`, `DataTable`). Never re-exported from `reusable`.

## The canonical slice: `features/auth/login`

Login is the one fully wired feature — copy it when building new ones. The data
flow is strictly one-directional:

```
page.tsx (layout)
  └─ container.tsx  useLogin()  → passes data/handlers as props
       ├─ hooks/useLogin.ts  useLogin()
       │    ├─ validates input (zod)
       │    ├─ useMutation(postLogin)         ← server state (TanStack Query)
       │    │    └─ service.ts  postLogin()
       │    │         └─ apiClient.post(...)   ← lib/api (the only axios instance)
       │    │              └─ loginResponseSchema.parse(data)  ← validated boundary
       │    └─ onSuccess: signIn(user, token)  ← client state, then redirects
       └─ Component.tsx  (props in) → feeds the pure pieces
            └─ sections/LoginForm.tsx  (pure UI: props in, callbacks out)
```

`shared/reusable` `Button` and `Input` are consumed by `LoginForm`.

## Server state vs client state — the boundary

This is the rule that keeps the app from turning into a tangle:

- **Server state = anything owned by the backend** (the user list, an order, the
  result of `/auth/login`). It lives **only** in TanStack Query. It is fetched,
  cached, invalidated, and retried by query/mutation hooks. Never copy it into
  Context "to keep it handy."
- **Client state = UI/session state the server doesn't own** (is the user
  authenticated, which modal is open, form draft values). It lives in React
  Context + `useReducer` (`src/app/auth`) or local component state.

The handoff happens in exactly one place per flow. For login, `useLogin`'s
mutation returns server data, and `onSuccess` writes the derived session
(`user` + `token`) into the auth Context via `signIn`. After that, components
read the session from `useAuth()` — they don't re-read the mutation.

**Why Context (not Zustand) here, and its cost:** any change to the auth
Context value re-renders every consumer. We accept that because the session
changes rarely (sign in / sign out) and the provider is deliberately lean —
session only. Do **not** push frequently-changing or server-owned data through
this Context; that's what TanStack Query is for. If client state later grows
hot, fast-changing slices, that's the point to reconsider a store like Zustand.

## When to collapse a feature's files

The full layout is the target for features with real behaviour. **Don't
force every file on a trivial feature.** Collapse when:

- there's no orchestration distinct from the page → drop `container.tsx`
- there's no async/derived logic → drop `hooks.ts`
- there's no backend access → drop `service.ts`
- there are no feature-local types or constants → drop `types.ts` / `constants.ts`
- there's only one tiny component → keep it in `page.tsx`, drop `sections/`

A pure static or "coming soon" view can legitimately be just `page.tsx` +
`index.ts`. Expand a feature into the full pattern the moment it gains data
fetching or non-trivial state — copy `features/auth/login`, which is currently
the only feature wired end to end.

## Quality gates

- TypeScript **strict** + `noUncheckedIndexedAccess` (and `exactOptionalPropertyTypes`,
  `noImplicitOverride`) in `tsconfig.app.json`.
- ESLint (flat config) + `eslint-config-prettier`; Prettier for formatting.
- An `ErrorBoundary` at the app root **and** around every lazy route, so one
  feature crashing never blanks the whole app.
- Every async data path goes through a TanStack Query hook calling the shared
  `apiClient` — **no bare `fetch`/axios in components.**
- No secrets in `VITE_` vars.

All four gates pass: `npm run typecheck`, `npm run lint`, `npm run build:prod`.
