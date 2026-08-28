import BlogCardSkeleton from "@/components/blog/blog-card-skeleton";

export default function BlogLoading() {
  return (
    <main className="relative min-h-screen bg-background/90 pt-28 pb-16 md:pt-36 md:pb-32">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-64 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 -right-64 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mb-12 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div className="w-full max-w-xl space-y-4">
            <div className="h-3 w-16 rounded-full bg-muted" />
            <div className="h-10 w-3/4 rounded-2xl bg-muted" />
          </div>
          <div className="h-12 w-full max-w-md rounded-2xl bg-muted sm:w-80" />
        </div>

        <div className="mb-10 flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-8 w-20 rounded-full bg-muted" />
          ))}
        </div>

        <div className="mb-10 grid gap-8 md:grid-cols-2">
          <BlogCardSkeleton featured />
          <BlogCardSkeleton featured />
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <BlogCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </main>
  );
}
