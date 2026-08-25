import styles from './LoadingScreen.module.css';

export interface LoadingScreenProps {
  /** Message under the loader. */
  message?: string;
  /**
   * Fill the parent (default) instead of covering the viewport.
   *
   * Inline is the default deliberately. Almost every use is a data-loading
   * state inside a routed screen that already has a header and nav around it,
   * and a fixed full-viewport splash over that chrome is indistinguishable
   * from the browser reloading the app. Pass `inline={false}` only on a route
   * that owns the whole viewport and has nothing behind it worth keeping.
   */
  inline?: boolean;
}

/**
 * Branded loading state — Evently wordmark + an indeterminate gradient bar.
 * Used as the lazy-route Suspense fallback and as the data-loading state for
 * routed screens. Fills its parent by default; see `inline`. Honors
 * prefers-reduced-motion.
 */
export function LoadingScreen({
  message = 'Setting up your celebration…',
  inline = true,
}: LoadingScreenProps) {
  return (
    <div className={`${styles.screen} ${inline ? styles.inline : ''}`} role="status" aria-live="polite">
      <div className={styles.brand}>
        <span className={styles.accent}>e</span>vently
      </div>
      <div className={styles.bar}><span className={styles.fill} /></div>
      <p className={styles.msg}>{message}</p>
      <span className="sr-only">Loading</span>
    </div>
  );
}
