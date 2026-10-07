import BlogGrid from "@/components/blog-grid";
import { HairlineKeyboard, HairlinePhosphor } from "@/components/hairline-terminal";
import { getPosts } from "@/lib/blog";
import { isSanityConfigured } from "@/sanity/env";
import styles from "./blog.module.css";

export const revalidate = 60;

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <main className={styles.page} id="top">
      <div className={styles.container}>
        <header className={styles.intro}>
          <p className={styles.eyebrow}>Writing / Field notes</p>
          <h1 className={styles.title}>
            Ideas, carefully
            <br />
            <em>worked through.</em>
          </h1>
          <div className={styles.workbench}>
            <p className={styles.description}>
              Thoughts on engineering, design, and the craft of building for the
              web—published from the workbench.
            </p>
            <HairlinePhosphor />
            <HairlineKeyboard />
          </div>
        </header>

        <BlogGrid posts={posts} showSetupState={!isSanityConfigured} />
      </div>
    </main>
  );
}
