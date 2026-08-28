import { formatPostDate, getPostAccent } from "@/lib/blog";
import { MOCK_BLOG_POST } from "@/lib/blog-fixtures";

export default function BlogPostFixture() {
  const post = MOCK_BLOG_POST;
  const accent = getPostAccent(post.accent);

  return (
    <main className="relative min-h-screen bg-background/90 pt-28 pb-16 md:pt-36 md:pb-32">
      <article className="relative mx-auto max-w-3xl px-6">
        <div className="mb-8 h-4 w-28 rounded-full bg-muted" />

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

          <p className="mb-4 text-lg font-semibold" style={{ color: accent }}>
            {post.subtitle}
          </p>

          <p className="text-base leading-relaxed text-muted-foreground">{post.description}</p>

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

          <div className="mt-8 h-10 w-40 rounded-full bg-muted" />
        </header>

        <div className="mb-10 aspect-[16/9] rounded-2xl border border-border bg-muted" />

        <div className="space-y-4">
          {["w-full", "w-[96%]", "w-[88%]", "w-full", "w-[72%]"].map((width) => (
            <div key={width} className="h-4 rounded-full bg-muted" style={{ width }} />
          ))}
        </div>
      </article>
    </main>
  );
}
