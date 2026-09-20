"use client";

import { HoverImg } from "@/components/block/hover-img";
import { getPostAccent, getPostGradient } from "@/lib/blog";
import { urlForImage } from "@/sanity/lib/image";

function postImage(post) {
  const coverUrl = post.coverImage
    ? urlForImage(post.coverImage)?.width(640).height(400).url()
    : null;

  if (coverUrl) return coverUrl;

  const accent = getPostAccent(post.accent).replace("#", "");
  return `https://placehold.co/640x400/${accent}/ffffff?text=${encodeURIComponent(post.title.slice(0, 20))}&font=raleway`;
}

export default function BlogHoverPreview({ posts }) {
  if (!posts.length) return null;

  const items = posts.slice(0, 5).map((post) => ({
    title: post.title,
    label: post.category ?? "Article",
    imageSrc: postImage(post),
    gradient: getPostGradient(getPostAccent(post.accent)),
  }));

  return (
    <div className="mb-10 hidden overflow-hidden rounded-2xl border border-border bg-card/50 lg:block">
      <div className="border-b border-border px-5 py-3">
        <p className="font-mono text-xs uppercase tracking-widest text-primary">Hover to preview</p>
      </div>
      <div className="relative min-h-[280px]">
        <HoverImg
          compact
          isContained
          className="!min-h-0 !bg-transparent !text-foreground [&_.hover-img-project]:border-border/70"
          projects={items.map(({ title, label, imageSrc }) => ({ title, label, imageSrc }))}
        />
      </div>
    </div>
  );
}
