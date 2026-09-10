"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Link001 } from "@/components/ui/skiper-ui/skiper40";
import ProjectPreview from "@/components/project-preview";
import { projectSurface, useThemeMode } from "@/lib/use-theme-mode";
import { cn } from "@/lib/utils";

export default function ProjectGalleryCard({
  project,
  index,
  onVibeHover,
  onEmojiDayHover,
  className,
}) {
  const themeMode = useThemeMode();
  const surface = projectSurface(project, themeMode);
  const [hovered, setHovered] = useState(false);

  const handleEnter = () => {
    setHovered(true);
    onVibeHover?.(true);
    onEmojiDayHover?.(true);
  };

  const handleLeave = () => {
    setHovered(false);
    onVibeHover?.(false);
    onEmojiDayHover?.(false);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8%" }}
      transition={{ duration: 0.45, delay: Math.min(index, 6) * 0.05, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border/80 bg-card",
        "shadow-[0_1px_0_rgba(255,255,255,0.6),0_20px_50px_hsl(var(--primary)/0.08)] transition-all duration-300",
        hovered && "-translate-y-1 border-primary/30 shadow-[0_24px_60px_hsl(var(--primary)/0.14)]",
        className,
      )}
    >
      <div className="absolute left-5 top-5 z-10 font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
        {String(index + 1).padStart(2, "0")}
      </div>

      <ProjectPreview project={project} hovered={hovered} aspectClass="aspect-[16/10] shrink-0" />

      <div className="relative flex flex-1 flex-col gap-3 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="mb-2 inline-flex rounded-full border border-border bg-secondary/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {project.category}
            </span>
            <h3 className="text-xl font-bold tracking-tight text-foreground">{project.title}</h3>
            <p className="mt-1 text-sm font-medium" style={{ color: surface.accent }}>
              {project.subtitle}
            </p>
          </div>
          <span className="shrink-0 font-mono text-xs text-muted-foreground">{project.year}</span>
        </div>

        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{project.description}</p>

        <div className="mt-auto flex flex-wrap gap-1.5">
          {project.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors group-hover:border-primary/25 group-hover:text-primary/80"
            >
              {tag}
            </span>
          ))}
        </div>

        <Link001
          href={project.url}
          className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-foreground transition-colors group-hover:text-primary"
        >
          View project
          <svg
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
          </svg>
        </Link001>
      </div>
    </motion.article>
  );
}
