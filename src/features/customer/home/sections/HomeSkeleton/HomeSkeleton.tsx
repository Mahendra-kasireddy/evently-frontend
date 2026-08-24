import styles from './HomeSkeleton.module.css';

/**
 * Home's loading state. The feed is one endpoint, so there is a single load —
 * but it renders the page's *shape* (hero band, then section bands) rather than
 * a centred spinner, so content appears in place instead of the layout jumping
 * once data lands.
 */
export function HomeSkeleton() {
  return (
    <main className={styles.page} aria-busy="true" aria-label="Loading your home page">
      <div className={styles.container}>
        <div className={`${styles.block} ${styles.hero}`} />
        <div className={styles.rowHead} />
        <div className={styles.grid}>
          {[0, 1, 2].map((i) => (
            <div key={i} className={`${styles.block} ${styles.card}`} />
          ))}
        </div>
        <div className={styles.rowHead} />
        <div className={styles.grid}>
          {[0, 1, 2].map((i) => (
            <div key={i} className={`${styles.block} ${styles.card}`} />
          ))}
        </div>
      </div>
    </main>
  );
}

export default HomeSkeleton;
