"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { ChevronRightIcon } from "@animateicons/react/lucide";
import { formatPostDate, getPostAccent, getPostGradient, getPostYear } from "@/lib/blog";
import { urlForImage } from "@/sanity/lib/image";

function BlogCardPreview({ post, hovered, accent }) {
  const coverUrl = post.coverImage
    ? urlForImage(post.coverImage)?.width(900).height(506).url()
    : null;

  if (coverUrl) {
    return (
      <div className="relative aspect-[16/9] overflow-hidden">
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
      className="relative aspect-[16/9] overflow-hidden"
      style={{ background: getPostGradient(accent) }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_55%)]" />
      <div className="absolute inset-x-8 top-8 space-y-3">
        <div className="h-3 rounded-full bg-foreground/10" style={{ width: "72%" }} />
        <div className="h-3 rounded-full bg-foreground/10" style={{ width: "92%" }} />
        <div className="h-3 rounded-full bg-foreground/10" style={{ width: "64%" }} />
        <div className="h-3 rounded-full bg-foreground/10" style={{ width: "80%" }} />
      </div>
      <div className="absolute bottom-8 left-8 btn-juicy btn-juicy-pill px-4 py-2 text-xs font-semibold">
        Read article
      </div>
    </div>
  );
}

export default function BlogCard({ post, index = 0, featured = false, disableMotion = false }) {
  const [hovered, setHovered] = useState(false);
  const readIconRef = useRef(null);
  const accent = getPostAccent(post.accent);
  const year = getPostYear(post.publishedAt);

  const Wrapper = disableMotion ? "article" : motion.article;
  const wrapperProps = disableMotion
    ? { className: `group ${featured ? "md:col-span-2" : ""}` }
    : {
        layout: true,
        initial: { opacity: 0, y: 60 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 30, scale: 0.97 },
        transition: { duration: 0.5, delay: index * 0.07 },
        onMouseEnter: () => setHovered(true),
        onMouseLeave: () => setHovered(false),
        className: `group ${featured ? "md:col-span-2" : ""}`,
      };

  return (
    <Wrapper {...wrapperProps}>
      <Link href={`/blog/${post.slug}`} className="block" data-cuelume-hover="whisper">
        <div
          className="overflow-hidden rounded-2xl glass-card transition-all duration-300 hover:shadow-2xl"
          style={{
            borderColor: hovered ? `${accent}44` : undefined,
            boxShadow: hovered ? `0 24px 60px ${accent}18` : undefined,
          }}
        >
          <div className="relative">
            <BlogCardPreview post={post} hovered={hovered} accent={accent} />

            {!disableMotion ? (
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
                  className="flex items-center gap-2.5 btn-juicy btn-juicy-pill px-7 py-3 text-sm font-bold"
                  onMouseEnter={() => readIconRef.current?.startAnimation()}
                  onMouseLeave={() => readIconRef.current?.stopAnimation()}
                >
                  Read Post
                  <ChevronRightIcon ref={readIconRef} size={16} color="currentColor" />
                </motion.span>
              </motion.div>
            ) : null}

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
    </Wrapper>
  );
}
