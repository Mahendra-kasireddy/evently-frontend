import styles from './LoadingScreen.module.css';

export interface LoadingScreenProps {
  /** Message under the loader. */
  message?: string;
  /** Render inline (fills its parent) instead of fixed full-screen. */
  inline?: boolean;
}

/**
 * Branded full-screen loading state — Evently wordmark + an indeterminate
 * gradient bar. Used as the lazy-route Suspense fallback. Honors
 * prefers-reduced-motion.
 */
export function LoadingScreen({ message = 'Setting up your celebration…', inline = false }: LoadingScreenProps) {
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
