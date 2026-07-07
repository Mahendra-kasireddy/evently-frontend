import { type ReactNode } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from './store';
import { ErrorBoundary } from './ErrorBoundary';

/**
 * The single provider tree. ErrorBoundary outermost; the Redux store provides
 * both client state (slices) and server state (RTK Query). Auth session lives
 * in the store's authSlice — no separate context/provider needed.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary scope="root">
      <ReduxProvider store={store}>{children}</ReduxProvider>
    </ErrorBoundary>
  );
}
