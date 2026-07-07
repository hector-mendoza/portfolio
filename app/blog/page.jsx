import BlogGrid from "@/components/blog-grid";
import { getPosts } from "@/lib/blog";
import { isSanityConfigured } from "@/sanity/env";

export const revalidate = 60;

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <main className="relative min-h-screen bg-background/90 pt-28 pb-16 md:pt-36 md:pb-32">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-64 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 -right-64 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mb-12 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <span className="mb-4 inline-block font-mono text-xs uppercase tracking-widest text-primary">
              06 / Blog
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              <span className="text-balance block">
                {"Featured "}
                <span className="text-gradient">writing</span>
              </span>
            </h1>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            Thoughts on engineering, design, and the craft of building for the web — powered by Sanity.
          </p>
        </div>

        <BlogGrid posts={posts} showSetupState={!isSanityConfigured} />
      </div>
    </main>
  );
}
