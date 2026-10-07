"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { ChevronRightIcon } from "@animateicons/react/lucide";
import { formatPostDate, getPostYear } from "@/lib/blog";
import { urlForImage } from "@/sanity/lib/image";

function BlogCardPreview({ post, hovered }) {
  const coverUrl = post.coverImage
    ? urlForImage(post.coverImage)?.width(900).height(506).url()
    : null;

  if (coverUrl) {
    return (
      <div className="relative aspect-[16/9] overflow-hidden">
        <img
          src={coverUrl}
          alt={post.coverImage?.alt ?? post.title}
          className="h-full w-full object-cover grayscale transition-transform duration-500 group-hover:scale-105"
        />
        <div className={`absolute inset-0 bg-black transition-opacity duration-300 ${hovered ? "opacity-35" : "opacity-10"}`} />
      </div>
    );
  }

  return (
    <div className="relative aspect-[16/9] overflow-hidden bg-neutral-950">
      <div className="absolute inset-0 bg-[linear-gradient(145deg,transparent_45%,rgba(255,255,255,0.08))]" />
      <div className="absolute inset-x-8 top-8 space-y-3">
        <div className="h-px bg-white/25" style={{ width: "72%" }} />
        <div className="h-px bg-white/25" style={{ width: "92%" }} />
        <div className="h-px bg-white/25" style={{ width: "64%" }} />
        <div className="h-px bg-white/25" style={{ width: "80%" }} />
      </div>
      <div className="absolute bottom-8 left-8 border border-white/50 px-4 py-2 text-xs font-semibold text-white">
        Read article
      </div>
    </div>
  );
}

export default function BlogCard({ post, index = 0, featured = false, disableMotion = false }) {
  const [hovered, setHovered] = useState(false);
  const readIconRef = useRef(null);
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
        <div className="overflow-hidden border border-black/20 bg-transparent transition-colors duration-300 hover:border-black">
          <div className="relative">
            <BlogCardPreview post={post} hovered={hovered} />

            {!disableMotion ? (
              <motion.div
                animate={{ opacity: hovered ? 1 : 0 }}
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  background: "rgba(0,0,0,0.62)",
                  backdropFilter: "blur(4px)",
                }}
              >
                <motion.span
                  animate={{ scale: hovered ? 1 : 0.8, opacity: hovered ? 1 : 0 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-center gap-2.5 border border-white bg-white px-7 py-3 text-sm font-bold text-black"
                  onMouseEnter={() => readIconRef.current?.startAnimation()}
                  onMouseLeave={() => readIconRef.current?.stopAnimation()}
                >
                  Read Post
                  <ChevronRightIcon ref={readIconRef} size={16} color="currentColor" />
                </motion.span>
              </motion.div>
            ) : null}

            <div className="absolute top-6 left-6 z-10">
              <span className="border border-white/30 bg-black/70 px-3 py-1.5 font-mono text-xs text-white backdrop-blur-sm">
                {post.category}
              </span>
            </div>
            <div className="absolute top-6 right-6 z-10">
              <span className="font-mono text-xs text-white/70">{year}</span>
            </div>
          </div>

          <div className={`p-6 sm:p-8 ${featured ? "sm:p-10" : ""}`}>
            <p className="mb-2 font-mono text-xs uppercase tracking-widest text-neutral-500">
              {formatPostDate(post.publishedAt)}
            </p>
            <h3 className={`mb-1 font-semibold tracking-tight text-black ${featured ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"}`}>
              {post.title}
            </h3>
            {post.subtitle ? (
              <p className="mb-3 font-serif text-sm italic text-neutral-700">
                {post.subtitle}
              </p>
            ) : null}
            <p className="mb-5 text-sm leading-relaxed text-neutral-600">{post.description}</p>
            {post.tags?.length ? (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="border border-black/20 px-2.5 py-1 text-xs text-neutral-600 transition-colors group-hover:border-black/50 group-hover:text-black"
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
