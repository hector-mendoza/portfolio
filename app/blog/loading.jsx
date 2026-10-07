import styles from "./blog.module.css";

export default function BlogLoading() {
  return (
    <main className={styles.page} aria-label="Loading writing">
      <div className={styles.container}>
        <div className={styles.loadingHeader}>
          <div className={styles.skeletonLine} />
          <div className={styles.skeletonTitle} />
          <div className={styles.skeletonLine} />
        </div>

        <div className={styles.skeletonGrid}>
          {Array.from({ length: 4 }).map((_, index) => (
            <div className={styles.skeletonCard} key={index} />
          ))}
        </div>
      </div>
    </main>
  );
}
