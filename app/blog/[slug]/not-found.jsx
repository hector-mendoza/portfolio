import Link from "next/link";

export default function BlogNotFound() {
  return (
    <main className="relative min-h-screen bg-background/90 pt-28 pb-16 md:pt-36 md:pb-32">
      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <p className="mb-4 font-mono text-xs uppercase tracking-widest text-primary">404</p>
        <h1 className="mb-4 text-4xl font-bold text-foreground">Post not found</h1>
        <p className="mb-8 text-muted-foreground">
          This article may have been moved or is not published yet.
        </p>
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground transition-all hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
        >
          Back to blog
        </Link>
      </div>
    </main>
  );
}
