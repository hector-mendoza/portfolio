import styles from "../blog.module.css";

export default function BlogPostLoading() {
  return (
    <main className={styles.page} aria-label="Loading article">
      <article className={styles.article}>
        <div className={styles.skeletonLine} style={{ width: "8rem" }} />
        <div
          className={styles.skeletonTitle}
          style={{ marginTop: "3rem", height: "10rem" }}
        />
        <div
          className={styles.skeletonLine}
          style={{ width: "70%", marginTop: "2rem" }}
        />
        <div
          className={styles.skeletonCard}
          style={{ minHeight: "420px", marginTop: "4rem" }}
        />
      </article>
    </main>
  );
}
