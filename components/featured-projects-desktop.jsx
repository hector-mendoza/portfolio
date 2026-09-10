"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Link001 } from "@/components/ui/skiper-ui/skiper40";
import { projectSurface, useThemeMode } from "@/lib/use-theme-mode";
import { cn } from "@/lib/utils";

function FeaturedPreview({ project, surface, className }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-gradient-to-br",
        surface.gradient,
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(255,255,255,0.14),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_100%,rgba(0,0,0,0.22),transparent_55%)]" />

      <div className="absolute inset-4 flex flex-col overflow-hidden rounded-xl border border-white/10 bg-black/25 backdrop-blur-sm">
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
          <span className="h-2 w-2 rounded-full bg-red-400/70" />
          <span className="h-2 w-2 rounded-full bg-yellow-400/70" />
          <span className="h-2 w-2 rounded-full bg-green-400/70" />
          <div className="mx-2 flex-1 truncate rounded-full bg-white/10 px-3 py-1 font-mono text-[10px] text-white/45">
            {project.preview.bar}
          </div>
        </div>
        <div className="flex flex-1 flex-col justify-end space-y-2 p-4">
          {project.preview.lines.map((width, index) => (
            <div
              key={width}
              className={cn("h-2 rounded-full bg-white/15", index === 0 && "h-3 bg-white/25")}
              style={{ width }}
            />
          ))}
          <div className="mt-3 flex gap-2">
            <div
              className="h-7 w-24 rounded-lg"
              style={{ background: `${surface.accent}99` }}
            />
            <div className="h-7 w-16 rounded-lg bg-white/10" />
          </div>
        </div>
      </div>

      <div
        className="pointer-events-none absolute -bottom-10 left-1/2 h-28 w-56 -translate-x-1/2 rounded-full blur-3xl opacity-40"
        style={{ background: surface.accent }}
      />
    </div>
  );
}

function FeaturedCard({ project, index, featured = false }) {
  const themeMode = useThemeMode();
  const surface = projectSurface(project, themeMode);
  const [hovered, setHovered] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8%" }}
      transition={{ duration: 0.65, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border/80 bg-card shadow-[0_1px_0_rgba(255,255,255,0.6),0_20px_50px_hsl(var(--primary)/0.08)] transition-all duration-300",
        hovered && " -translate-y-1 border-primary/30 shadow-[0_24px_60px_hsl(var(--primary)/0.14)]",
        featured && "min-h-[520px]",
      )}
    >
      <div className="absolute left-6 top-6 z-10 font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
        {String(index + 1).padStart(2, "0")}
      </div>

      <FeaturedPreview
        project={project}
        surface={surface}
        className={featured ? "min-h-[280px] flex-1" : "aspect-[16/10] shrink-0"}
      />

      <div className={cn("relative flex flex-col gap-3 p-6", featured && "p-8")}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="mb-2 inline-flex rounded-full border border-border bg-secondary/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {project.category}
            </span>
            <h3 className={cn("font-bold tracking-tight text-foreground", featured ? "text-3xl" : "text-xl")}>
              {project.title}
            </h3>
            <p className="mt-1 text-sm font-medium" style={{ color: surface.accent }}>
              {project.subtitle}
            </p>
          </div>
          <span className="font-mono text-xs text-muted-foreground">{project.year}</span>
        </div>

        <p className={cn("leading-relaxed text-muted-foreground", featured ? "line-clamp-3 text-sm" : "line-clamp-2 text-sm")}>
          {project.description}
        </p>

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

export default function FeaturedProjectsDesktop({ projects, className }) {
  const [primary, ...rest] = projects.slice(0, 3);
  if (!primary) return null;

  return (
    <div className={cn("mb-14", className)}>
      <div className="mb-8 flex items-end justify-between gap-6">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
            Curated highlights
          </p>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Hand-picked builds — recent client work, experiments, and tools worth a closer look.
          </p>
        </div>
        <div className="hidden h-px flex-1 bg-gradient-to-r from-border via-primary/20 to-transparent lg:block" />
      </div>

      <div className="grid gap-6 lg:grid-cols-12 lg:grid-rows-2">
        <div className="lg:col-span-7 lg:row-span-2">
          <FeaturedCard project={primary} index={0} featured />
        </div>
        {rest.map((project, index) => (
          <div key={project.title} className="lg:col-span-5">
            <FeaturedCard project={project} index={index + 1} />
          </div>
        ))}
      </div>
    </div>
  );
}
