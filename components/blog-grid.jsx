"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { formatPostDate, getPostAccent, getPostGradient, getPostYear } from "@/lib/blog";
import { urlForImage } from "@/sanity/lib/image";

const FILTERS = [
  { label: "Recent", value: "recent" },
  { label: "Featured", value: "featured" },
  { label: "All", value: "all" },
];

function BlogCardPreview({ post, hovered, accent }) {
  const coverUrl = post.coverImage
    ? urlForImage(post.coverImage)?.width(900).height(520).url()
    : null;

  if (coverUrl) {
    return (
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={coverUrl}
          alt={post.coverImage?.alt ?? post.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div
          className="absolute inset-0 opacity-40 transition-opacity duration-300"
          style={{
            background: `linear-gradient(to top, ${accent}88 0%, transparent 60%)`,
            opacity: hovered ? 0.55 : 0.35,
          }}
        />
      </div>
    );
  }

  return (
    <div
      className="relative aspect-[16/10] overflow-hidden"
      style={{ background: getPostGradient(accent) }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_55%)]" />
      <div className="absolute inset-x-8 top-8 space-y-3">
        <div className="h-3 rounded-full bg-foreground/10" style={{ width: "72%" }} />
        <div className="h-3 rounded-full bg-foreground/10" style={{ width: "92%" }} />
        <div className="h-3 rounded-full bg-foreground/10" style={{ width: "64%" }} />
        <div className="h-3 rounded-full bg-foreground/10" style={{ width: "80%" }} />
      </div>
      <div
        className="absolute bottom-8 left-8 rounded-full px-4 py-2 text-xs font-semibold text-white"
        style={{ background: accent }}
      >
        Read article
      </div>
    </div>
  );
}

function BlogCard({ post, index, featured = false }) {
  const [hovered, setHovered] = useState(false);
  const accent = getPostAccent(post.accent);
  const year = getPostYear(post.publishedAt);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30, scale: 0.97 }}
      transition={{ duration: 0.5, delay: index * 0.07 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`group ${featured ? "md:col-span-2" : ""}`}
    >
      <Link href={`/blog/${post.slug}`} className="block">
        <div
          className="overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:shadow-2xl"
          style={{
            borderColor: hovered ? `${accent}44` : undefined,
            boxShadow: hovered ? `0 24px 60px ${accent}18` : undefined,
          }}
        >
          <div className="relative">
            <BlogCardPreview post={post} hovered={hovered} accent={accent} />

            <motion.div
              animate={{ opacity: hovered ? 1 : 0 }}
              className="absolute inset-0 flex items-center justify-center"
              style={{
                background: `radial-gradient(ellipse at center, ${accent}30 0%, rgba(0,0,0,0.55) 100%)`,
                backdropFilter: "blur(4px)",
              }}
            >
              <motion.span
                animate={{ scale: hovered ? 1 : 0.8, opacity: hovered ? 1 : 0 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center gap-2.5 rounded-full px-7 py-3 text-sm font-bold text-white"
                style={{
                  background: accent,
                  boxShadow: `0 8px 30px ${accent}70, 0 0 0 1px ${accent}40`,
                }}
              >
                Read Post
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </motion.span>
            </motion.div>

            <div className="absolute top-6 left-6 z-10">
              <span className="rounded-full border border-white/10 bg-background/70 px-3 py-1.5 font-mono text-xs text-foreground/80 backdrop-blur-sm">
                {post.category}
              </span>
            </div>
            <div className="absolute top-6 right-6 z-10">
              <span className="font-mono text-xs text-white/70">{year}</span>
            </div>
          </div>

          <div className={`p-6 sm:p-8 ${featured ? "sm:p-10" : ""}`}>
            <p className="mb-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
              {formatPostDate(post.publishedAt)}
            </p>
            <h3 className={`mb-1 font-bold text-foreground ${featured ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"}`}>
              {post.title}
            </h3>
            {post.subtitle ? (
              <p className="mb-3 text-sm font-semibold" style={{ color: accent }}>
                {post.subtitle}
              </p>
            ) : null}
            <p className="mb-5 text-sm leading-relaxed text-muted-foreground">{post.description}</p>
            {post.tags?.length ? (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors group-hover:border-primary/25 group-hover:text-primary/80"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

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
