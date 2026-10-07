import Link from "next/link";
import { HairlineDrawer } from "@/components/hairline-terminal";
import styles from "../blog.module.css";

export default function BlogNotFound() {
  return (
    <main className={styles.notFound}>
      <p className={styles.eyebrow}>404 / Missing dispatch</p>
      <h1>Post not found.</h1>
      <p>This article may have been moved or is not published yet.</p>
      <div className={styles.articleFigure}>
        <HairlineDrawer />
      </div>
      <Link href="/blog">Back to writing</Link>
    </main>
  );
}
