import { type ReactNode } from 'react';

export interface AsyncSectionProps {
  isLoading: boolean;
  isError: boolean;
  isEmpty?: boolean;
  loading: ReactNode;
  error?: ReactNode;
  empty?: ReactNode;
  children: ReactNode;
}

/**
 * Stateful shared widget: renders the right branch for an async data section
 * (loading / error / empty / content). Keeps every data-driven section
 * consistent without repeating the same conditionals. Lives in
 * shared/components because it owns presentational branching logic.
 */
export function AsyncSection({
  isLoading,
  isError,
  isEmpty = false,
  loading,
  error,
  empty,
  children,
}: AsyncSectionProps) {
  if (isLoading) return <>{loading}</>;
  if (isError) {
    return (
      <>
        {error ?? (
          <p role="alert" style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
            Something went wrong loading this section. Please try again.
          </p>
        )}
      </>
    );
  }
  if (isEmpty) {
    return (
      <>
        {empty ?? (
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
            Nothing to show here yet.
          </p>
        )}
      </>
    );
  }
  return <>{children}</>;
}
