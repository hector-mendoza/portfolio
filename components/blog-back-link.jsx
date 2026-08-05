"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronLeft, ArrowLeft } from "lucide";
import { MorphIconHover } from "@/components/morph-icon-hover";

export default function BlogBackLink() {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href="/blog"
      data-cuelume-hover="tick"
      className="mb-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <MorphIconHover
        icon={ChevronLeft}
        hoverIcon={ArrowLeft}
        hovered={hovered}
        size={16}
        color="currentColor"
      />
      Back to blog
    </Link>
  );
}
