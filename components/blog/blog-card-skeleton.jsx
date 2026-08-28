"use client";

import { Skeleton } from "boneyard-js/react";
import BlogCardFixture from "@/components/blog/blog-card-fixture";

export default function BlogCardSkeleton({ featured = false, className = "" }) {
  const name = featured ? "blog-card-featured" : "blog-card";

  return (
    <Skeleton
      name={name}
      loading
      className={className}
      fixture={<BlogCardFixture featured={featured} />}
      snapshotConfig={{ leafTags: ["article", "a"] }}
      animate="shimmer"
      darkColor="hsl(200 8% 14%)"
      shimmerColor="hsl(168 45% 42% / 0.15)"
    />
  );
}
