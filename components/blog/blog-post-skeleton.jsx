"use client";

import { Skeleton } from "boneyard-js/react";
import BlogPostFixture from "@/components/blog/blog-post-fixture";

export default function BlogPostSkeleton() {
  return (
    <Skeleton
      name="blog-post"
      loading
      fixture={<BlogPostFixture />}
      snapshotConfig={{ leafTags: ["article", "header", "section"] }}
      animate="shimmer"
      darkColor="hsl(200 8% 14%)"
      shimmerColor="hsl(168 45% 42% / 0.15)"
    />
  );
}
