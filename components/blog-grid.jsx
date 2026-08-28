"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import BlogCard from "@/components/blog/blog-card";

const FILTERS = [
  { label: "Recent", value: "recent" },
  { label: "Featured", value: "featured" },
  { label: "All", value: "all" },
];

export default function BlogGrid({ posts, showSetupState = false }) {
  const [activeFilter, setActiveFilter] = useState("recent");

  const categories = useMemo(() => {
    return [...new Set(posts.map((post) => post.category).filter(Boolean))];
  }, [posts]);

  const filters = useMemo(() => {
    return [
      ...FILTERS,
      ...categories.map((category) => ({ label: category, value: category })),
    ];
  }, [categories]);

  const filteredPosts = useMemo(() => {
    if (activeFilter === "featured") {
      return posts.filter((post) => post.featured);
    }

    if (activeFilter === "all") {
      return posts;
    }

    if (activeFilter === "recent") {
      return [...posts].sort(
        (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
      );
    }

    return posts.filter((post) => post.category === activeFilter);
  }, [activeFilter, posts]);

  const featuredPosts = useMemo(() => posts.filter((post) => post.featured), [posts]);
  const showFeaturedRow = activeFilter === "recent" && featuredPosts.length > 0;

  if (showSetupState) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/60 p-10 text-center">
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-primary">
          Sanity setup required
        </p>
        <h3 className="mb-3 text-2xl font-bold text-foreground">Connect your Sanity project</h3>
        <p className="mx-auto mb-6 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Add your Sanity project ID and dataset to `.env.local`, then open the studio to publish
          your first post.
        </p>
        <Link
          href="/studio"
          data-cuelume-press
          data-cuelume-release
          className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground transition-all hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
        >
          Open Sanity Studio
        </Link>
      </div>
    );
  }

  if (!posts.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/60 p-10 text-center">
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-primary">No posts yet</p>
        <h3 className="mb-3 text-2xl font-bold text-foreground">Publish your first article</h3>
        <p className="mx-auto mb-6 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Head to Sanity Studio to write your first post. Featured posts will appear in the highlighted
          row at the top of this page.
        </p>
        <Link
          href="/studio"
          data-cuelume-press
          data-cuelume-release
          className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground transition-all hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
        >
          Open Sanity Studio
        </Link>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mb-10 flex flex-wrap gap-2"
      >
        {filters.map((filter) => (
          <button
            key={filter.value}
            type="button"
            data-cuelume-toggle
            onClick={() => setActiveFilter(filter.value)}
            className={`rounded-full px-4 py-1.5 font-mono text-xs transition-all duration-200 ${
              activeFilter === filter.value
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "border border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </motion.div>

      {showFeaturedRow ? (
        <div className="mb-10">
          <div className="mb-5 flex items-center gap-3">
            <span className="font-mono text-xs uppercase tracking-widest text-primary">Featured</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            {featuredPosts.map((post, index) => (
              <BlogCard key={post._id} post={post} index={index} featured />
            ))}
          </div>
        </div>
      ) : null}

      <div className="grid gap-8 md:grid-cols-2">
        {(showFeaturedRow
          ? filteredPosts.filter((post) => !post.featured)
          : filteredPosts
        ).map((post, index) => (
          <BlogCard key={post._id} post={post} index={index} />
        ))}
      </div>
    </>
  );
}
