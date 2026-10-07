"use client";

import { HoverImg } from "@/components/block/hover-img";
import { urlForImage } from "@/sanity/lib/image";

function postImage(post) {
  const coverUrl = post.coverImage
    ? urlForImage(post.coverImage)?.width(640).height(400).url()
    : null;

  if (coverUrl) return coverUrl;

  return `https://placehold.co/640x400/111111/f5f5f5?text=${encodeURIComponent(post.title.slice(0, 20))}&font=raleway`;
}

export default function BlogHoverPreview({ posts }) {
  if (!posts.length) return null;

  const items = posts.slice(0, 5).map((post) => ({
    title: post.title,
    label: post.category ?? "Article",
    imageSrc: postImage(post),
  }));

  return (
    <div className="mb-10 hidden overflow-hidden border border-black/20 bg-transparent lg:block">
      <div className="border-b border-black/20 px-5 py-3">
        <p className="font-mono text-xs uppercase tracking-widest text-black">Hover to preview</p>
      </div>
      <div className="relative min-h-[280px]">
        <HoverImg
          compact
          isContained
          className="!min-h-0 !bg-transparent !text-black [&_.hover-img-project]:border-black/20"
          projects={items.map(({ title, label, imageSrc }) => ({ title, label, imageSrc }))}
        />
      </div>
    </div>
  );
}
