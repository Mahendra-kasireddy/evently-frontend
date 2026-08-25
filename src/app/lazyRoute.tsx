import { Suspense, type ComponentType, type LazyExoticComponent } from 'react';
import { LoadingScreen } from '@shared/components';
import { ErrorBoundary } from './ErrorBoundary';

/**
 * How the Suspense fallback occupies the screen while a chunk downloads.
 *
 * `inline` fills the routed content area and leaves the surrounding shell —
 * header, nav, footer — mounted and visible. This is the default, and it is
 * what makes switching sections read as navigation instead of a page reload:
 * a fixed full-viewport splash over the top of the chrome is visually
 * indistinguishable from the browser reloading the app.
 *
 * `screen` is the full-bleed branded splash. Correct only for routes that
 * carry their own chrome and have nothing to preserve behind them — the
 * landing page, login, join, welcome, onboarding.
 */
export type RouteFallback = 'inline' | 'screen';

/**
 * Wraps a lazy-loaded feature page in BOTH a per-route ErrorBoundary and a
 * Suspense fallback. This is how every top-level feature is code-split:
 * one chunk per feature, isolated failures, consistent loading UI.
 */
export function lazyRoute(
  Page: LazyExoticComponent<ComponentType>,
  scope: string,
  fallback: RouteFallback = 'inline',
) {
  return (
    <ErrorBoundary scope={scope}>
      <Suspense fallback={<LoadingScreen inline={fallback === 'inline'} />}>
        <Page />
      </Suspense>
    </ErrorBoundary>
  );
}
