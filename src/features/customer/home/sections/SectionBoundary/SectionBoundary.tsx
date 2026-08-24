import type { ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { ErrorBoundary } from '@app/ErrorBoundary';
import styles from './SectionBoundary.module.css';

export interface SectionBoundaryProps {
  /** Section name — used for the telemetry scope only, never shown to users. */
  name: string;
  children: ReactNode;
}

/**
 * Isolates one Home section. If a section throws — an unexpected data shape, a
 * failing child — only that band of the page is replaced by a compact retry
 * card; the rest of Home keeps rendering and stays usable.
 *
 * Reuses the app's existing ErrorBoundary with a custom fallback, because the
 * default one is full-height and prints `error.message`, which must never reach
 * a customer.
 */
export function SectionBoundary({ name, children }: SectionBoundaryProps) {
  return (
    <ErrorBoundary
      scope={`home:${name}`}
      fallback={(_error: Error, reset: () => void) => (
        <section className={styles.card} role="alert">
          <span className={styles.icon}>
            <AlertTriangle size={18} />
          </span>
          <p className={styles.text}>Unable to load this section.</p>
          <button type="button" className={styles.retry} onClick={reset}>
            <RotateCcw size={14} /> Try again
          </button>
        </section>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

export default SectionBoundary;
