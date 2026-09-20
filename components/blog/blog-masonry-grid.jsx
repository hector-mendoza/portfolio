"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { formatPostDate, getPostAccent, getPostGradient } from "@/lib/blog";
import { urlForImage } from "@/sanity/lib/image";

function postImage(post) {
  const coverUrl = post.coverImage
    ? urlForImage(post.coverImage)?.width(640).height(480).url()
    : null;

  if (coverUrl) return coverUrl;

  const accent = getPostAccent(post.accent).replace("#", "");
  return `https://placehold.co/640x480/${accent}/ffffff?text=${encodeURIComponent(post.title.slice(0, 24))}&font=raleway`;
}

export default function BlogMasonryGrid({ posts }) {
  return (
    <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
      {posts.map((post, index) => {
        const image = postImage(post);
        const accent = getPostAccent(post.accent);
        const rowIndex = Math.floor(index / 3);

        return (
          <motion.article
            key={post._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.5, delay: rowIndex * 0.08 } }}
            className="mb-4 break-inside-avoid"
          >
            <Link href={`/blog/${post.slug}`} className="group block" data-cuelume-hover="whisper">
              <div className="overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10">
                <div className="relative overflow-hidden">
                  {post.coverImage ? (
                    <Image
                      src={image}
                      alt={post.coverImage?.alt ?? post.title}
                      width={640}
                      height={480}
                      className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div
                      className="aspect-[4/3] w-full"
                      style={{ background: getPostGradient(accent) }}
                    />
                  )}
                </div>
                <div className="space-y-2 p-5">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {formatPostDate(post.publishedAt)}
                  </p>
                  <h3 className="text-lg font-bold text-foreground transition-colors group-hover:text-primary">
                    {post.title}
                  </h3>
                  <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                    {post.description}
                  </p>
                </div>
              </div>
            </Link>
          </motion.article>
        );
      })}
    </div>
  );
}
