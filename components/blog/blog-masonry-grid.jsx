"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { formatPostDate } from "@/lib/blog";
import { urlForImage } from "@/sanity/lib/image";

function postImage(post) {
  const coverUrl = post.coverImage
    ? urlForImage(post.coverImage)?.width(640).height(480).url()
    : null;

  if (coverUrl) return coverUrl;

  return `https://placehold.co/640x480/111111/f5f5f5?text=${encodeURIComponent(post.title.slice(0, 24))}&font=raleway`;
}

export default function BlogMasonryGrid({ posts }) {
  return (
    <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
      {posts.map((post, index) => {
        const image = postImage(post);
        const rowIndex = Math.floor(index / 3);

        return (
          <motion.article
            key={post._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.5, delay: rowIndex * 0.08 } }}
            className="mb-4 break-inside-avoid"
          >
            <Link href={`/blog/${post.slug}`} className="group block" data-cuelume-hover="whisper">
              <div className="overflow-hidden border border-black/20 bg-transparent transition-colors duration-300 hover:border-black">
                <div className="relative overflow-hidden">
                  {post.coverImage ? (
                    <Image
                      src={image}
                      alt={post.coverImage?.alt ?? post.title}
                      width={640}
                      height={480}
                      className="h-auto w-full object-cover grayscale transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="aspect-[4/3] w-full bg-neutral-950 bg-[linear-gradient(145deg,transparent_45%,rgba(255,255,255,0.08))]" />
                  )}
                </div>
                <div className="space-y-2 p-5">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                    {formatPostDate(post.publishedAt)}
                  </p>
                  <h3 className="text-lg font-semibold tracking-tight text-black">
                    {post.title}
                  </h3>
                  <p className="line-clamp-3 text-sm leading-relaxed text-neutral-600">
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
