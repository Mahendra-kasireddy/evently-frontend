import { Suspense, type ComponentType, type LazyExoticComponent } from 'react';
import { LoadingScreen } from '@shared/components';
import { ErrorBoundary } from './ErrorBoundary';

/**
 * Wraps a lazy-loaded feature page in BOTH a per-route ErrorBoundary and a
 * Suspense fallback. This is how every top-level feature is code-split:
 * one chunk per feature, isolated failures, consistent loading UI.
 */
export function lazyRoute(
  Page: LazyExoticComponent<ComponentType>,
  scope: string,
) {
  return (
    <ErrorBoundary scope={scope}>
      <Suspense fallback={<LoadingScreen />}>
        <Page />
      </Suspense>
    </ErrorBoundary>
  );
}
