"use client";

import Link from "next/link";
import { HoverImg } from "@/components/block/hover-img";

function projectImageSrc(project) {
  const slug = project.title.replace(/\s+/g, "+");
  const color = (project.accent ?? "4a7c59").replace("#", "");
  return `https://placehold.co/400x250/${color}/ffffff?text=${encodeURIComponent(slug)}&font=raleway`;
}

export default function ProjectHoverPreview({ projects }) {
  if (!projects.length) return null;

  const items = projects.slice(0, 6).map((project) => ({
    title: project.title,
    label: project.subtitle,
    imageSrc: projectImageSrc(project),
    href: project.url,
  }));

  return (
    <div className="mb-8 hidden overflow-hidden rounded-2xl border border-border bg-card/50 lg:block">
      <div className="border-b border-border px-5 py-3">
        <p className="font-mono text-xs uppercase tracking-widest text-primary">Quick browse</p>
      </div>
      <div className="relative min-h-[320px]">
        <HoverImg
          compact
          isContained
          className="!min-h-0 !bg-transparent !text-foreground [&_.hover-img-project]:border-border/70"
          projects={items.map(({ title, label, imageSrc }) => ({ title, label, imageSrc }))}
        />
        <div className="pointer-events-none absolute inset-0">
          {items.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="sr-only"
              tabIndex={-1}
            >
              {item.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
