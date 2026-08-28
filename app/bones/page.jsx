import BlogCardSkeleton from "@/components/blog/blog-card-skeleton";
import BlogPostSkeleton from "@/components/blog/blog-post-skeleton";

export default function BonesPage() {
  return (
    <main className="space-y-16 bg-background p-6">
      <section className="mx-auto max-w-2xl">
        <BlogCardSkeleton />
      </section>
      <section className="mx-auto max-w-4xl">
        <BlogCardSkeleton featured />
      </section>
      <section>
        <BlogPostSkeleton />
      </section>
    </main>
  );
}
