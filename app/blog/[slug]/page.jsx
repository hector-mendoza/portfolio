import Link from "next/link";
import { notFound } from "next/navigation";
import BlogPortableText from "@/components/blog-portable-text";
import {
  formatPostDate,
  getPostAccent,
  getPostBySlug,
  getPostSlugs,
} from "@/lib/blog";
import { urlForImage } from "@/sanity/lib/image";

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
      url: `https://hectormendoza.com/blog/${post.slug}`,
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

  const accent = getPostAccent(post.accent);
  const coverUrl = post.coverImage
    ? urlForImage(post.coverImage)?.width(1400).height(780).url()
    : null;

  return (
    <main className="relative min-h-screen bg-background/90 pt-28 pb-16 md:pt-36 md:pb-32">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-64 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 -right-64 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <article className="relative mx-auto max-w-3xl px-6">
        <Link
          href="/blog"
          className="mb-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
          </svg>
          Back to blog
        </Link>

        <header className="mb-10">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-border px-3 py-1 font-mono text-xs text-muted-foreground">
              {post.category}
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              {formatPostDate(post.publishedAt)}
            </span>
          </div>

          <h1 className="mb-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            {post.title}
          </h1>

          {post.subtitle ? (
            <p className="mb-4 text-lg font-semibold" style={{ color: accent }}>
              {post.subtitle}
            </p>
          ) : null}

          <p className="text-base leading-relaxed text-muted-foreground">{post.description}</p>

          {post.tags?.length ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </header>

        {coverUrl ? (
          <div className="mb-10 overflow-hidden rounded-2xl border border-border">
            <img
              src={coverUrl}
              alt={post.coverImage?.alt ?? post.title}
              className="aspect-[16/10] w-full object-cover"
            />
          </div>
        ) : null}

        <BlogPortableText value={post.body} />
      </article>
    </main>
  );
}
