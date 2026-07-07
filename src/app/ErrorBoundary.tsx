import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  /** Optional label to distinguish the app-root boundary from per-route ones. */
  scope?: string;
  /** Custom fallback. Receives the error and a reset callback. */
  fallback?: (error: Error, reset: () => void) => ReactNode;
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Class component because React error boundaries require lifecycle methods that
 * have no hook equivalent. Used twice: once at the app root, once per lazy
 * route (so one feature crashing never blanks the whole app).
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  override state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    // Wire to your telemetry (Sentry/Datadog) here.
    console.error(
      `[ErrorBoundary${this.props.scope ? `:${this.props.scope}` : ''}]`,
      error,
      info.componentStack,
    );
  }

  reset = (): void => this.setState({ error: null });

  override render(): ReactNode {
    const { error } = this.state;
    if (error) {
      if (this.props.fallback) return this.props.fallback(error, this.reset);
      return (
        <div
          role="alert"
          className="flex min-h-[40vh] flex-col items-center justify-center gap-3 p-6 text-center"
        >
          <h2 className="text-lg font-semibold text-gray-900">
            Something went wrong
          </h2>
          <p className="max-w-md text-sm text-gray-600">{error.message}</p>
          <button
            type="button"
            onClick={this.reset}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
