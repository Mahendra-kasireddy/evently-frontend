import styles from './ErrorState.module.css';

export interface ErrorStateProps {
  /** Message shown under the wordmark. */
  message?: string;
  /** When provided, renders a "Try again" button that calls this. */
  onRetry?: () => void;
  /** Render inline (fills its parent) instead of fixed full-screen. */
  inline?: boolean;
}

/**
 * Branded error state — Evently wordmark + message + optional retry. Used when
 * a page's data fetch fails (e.g. the home feed). Mirrors LoadingScreen so the
 * transition between loading → error is visually consistent.
 */
export function ErrorState({
  message = 'Something went wrong while loading this page.',
  onRetry,
  inline = false,
}: ErrorStateProps) {
  return (
    <div className={`${styles.screen} ${inline ? styles.inline : ''}`} role="alert">
      <div className={styles.brand}>
        <span className={styles.accent}>e</span>vently
      </div>
      <p className={styles.msg}>{message}</p>
      {onRetry && (
        <button type="button" className={styles.retry} onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
