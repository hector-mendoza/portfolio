import { notFound } from "next/navigation";
import BlogPortableText from "@/components/blog-portable-text";
import BlogBackLink from "@/components/blog-back-link";
import { HairlineLoupe } from "@/components/hairline-terminal";
import BlogShare from "@/components/blog-share";
import {
  formatPostDate,
  getPostBySlug,
  getPostSlugs,
} from "@/lib/blog";
import { urlForImage } from "@/sanity/lib/image";
import styles from "../blog.module.css";

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getPostSlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return { title: "Post not found | Hector Mendoza" };
  }

  const coverImage = post.coverImage
    ? urlForImage(post.coverImage)?.width(1200).height(630).url()
    : undefined;

  return {
    title: `${post.title} | Hector Mendoza`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.publishedAt,
      url: `https://www.hectormendoza.me/blog/${post.slug}`,
      ...(coverImage ? { images: [{ url: coverImage, width: 1200, height: 630, alt: post.title }] } : {}),
    },
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const coverUrl = post.coverImage
    ? urlForImage(post.coverImage)?.width(1400).height(780).url()
    : null;

  return (
    <main className={styles.page} id="top">
      <article className={styles.article}>
        <BlogBackLink />

        <div className={styles.articleFigure}>
          <HairlineLoupe />
        </div>

        <header className={styles.articleHeader}>
          <div className={styles.meta}>
            <span>{post.category}</span>
            <span>{formatPostDate(post.publishedAt)}</span>
          </div>

          <h1 className={styles.articleTitle}>{post.title}</h1>

          {post.subtitle ? (
            <p className={styles.subtitle}>{post.subtitle}</p>
          ) : null}

          <p className={styles.articleDescription}>{post.description}</p>

          {post.tags?.length ? (
            <div className={styles.tags}>
              {post.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          ) : null}

          <BlogShare
            title={post.title}
            url={`https://www.hectormendoza.me/blog/${post.slug}`}
            description={post.description}
          />
        </header>

        {coverUrl ? (
          <div className={styles.cover}>
            <img
              src={coverUrl}
              alt={post.coverImage?.alt ?? post.title}
            />
          </div>
        ) : null}

        <BlogPortableText value={post.body} />
      </article>
    </main>
  );
}
