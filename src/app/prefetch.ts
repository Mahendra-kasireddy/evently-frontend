/**
 * Route chunk warming.
 *
 * Every feature page is a separate chunk (see router.tsx). That keeps the first
 * paint small, but it means the first click on a nav item has to fetch JS before
 * anything can render — which is what made switching sections feel like a full
 * page reload. Warming the chunk before the click removes the wait entirely.
 *
 * The import specifiers here are byte-identical to the ones in router.tsx, so
 * the bundler resolves them to the SAME chunk. Warming does not duplicate code;
 * it just moves the download earlier, and the second import resolves straight
 * from the module cache.
 */
type Thunk = () => Promise<unknown>;

const ROUTES: Record<string, Thunk> = {
  // Customer shell
  '/home': () => import('@features/customer/home/page'),
  '/plan': () => import('@features/customer/plan/page'),
  '/discover': () => import('@features/customer/discover/page'),
  '/workspace': () => import('@features/customer/workspace/page'),
  '/profile': () => import('@features/customer/profile/page'),
  '/settings': () => import('@features/customer/settings/page'),

  // Organizer shell
  '/organizer/home': () => import('@features/organizer/home/page'),
  '/organizer/quotes': () => import('@features/organizer/quotes/page'),
  '/organizer/quote-builder': () => import('@features/organizer/quote-builder/page'),
  '/organizer/events': () => import('@features/organizer/events/page'),
  '/organizer/subvendors': () => import('@features/organizer/subvendors/page'),
  '/organizer/calendar': () => import('@features/organizer/calendar/page'),
  '/organizer/earnings': () => import('@features/organizer/earnings/page'),
  '/organizer/badges': () => import('@features/organizer/badges/page'),
  '/organizer/academy': () => import('@features/organizer/academy/page'),
  '/organizer/profile': () => import('@features/organizer/profile/page'),

  // Sub-vendor shell
  '/subvendor/home': () => import('@features/subvendor/home/page'),
  '/subvendor/payments': () => import('@features/subvendor/payments/page'),
  '/subvendor/profile': () => import('@features/subvendor/profile/page'),
};

/** Paths already requested — warming twice would be wasted work. */
const requested = new Set<string>();

/**
 * Starts fetching the chunk behind a path. Safe to call repeatedly, on every
 * hover, and with a path that has no entry (deep links with params) — it simply
 * does nothing then.
 *
 * A failure is swallowed on purpose: this is an optimisation. If the network
 * drops here, the real navigation will surface the error through the route's
 * own ErrorBoundary rather than throwing from a hover handler.
 */
export function prefetchRoute(to: string): void {
  const path = to.split('?')[0]!.split('#')[0]!;
  if (requested.has(path)) return;
  const load = ROUTES[path];
  if (!load) return;
  requested.add(path);
  void load().catch(() => {
    // Let the real navigation retry and report.
    requested.delete(path);
  });
}

/**
 * Warms several paths once the browser is idle, so even a fast first click
 * lands on an already-downloaded chunk. Runs after paint and never competes
 * with the initial render.
 */
export function warmRoutes(paths: readonly string[]): () => void {
  const run = () => paths.forEach(prefetchRoute);

  const idle = (
    window as unknown as {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (handle: number) => void;
    }
  ).requestIdleCallback;

  if (typeof idle === 'function') {
    const handle = idle(run, { timeout: 2500 });
    return () => {
      (window as unknown as { cancelIdleCallback?: (h: number) => void }).cancelIdleCallback?.(
        handle,
      );
    };
  }

  // Safari has no requestIdleCallback; a short delay is close enough.
  const timer = window.setTimeout(run, 900);
  return () => window.clearTimeout(timer);
}
