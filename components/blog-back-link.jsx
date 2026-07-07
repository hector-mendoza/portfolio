"use client";

import Link from "next/link";
import { useRef } from "react";
import { ChevronLeftIcon } from "@animateicons/react/lucide";

export default function BlogBackLink() {
  const ref = useRef(null);

  return (
    <Link
      href="/blog"
      className="mb-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary"
      onMouseEnter={() => ref.current?.startAnimation()}
      onMouseLeave={() => ref.current?.stopAnimation()}
    >
      <ChevronLeftIcon ref={ref} size={16} color="currentColor" />
      Back to blog
    </Link>
  );
}
