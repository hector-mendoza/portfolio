"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MorphIcon } from "morphicons/react";
import { ArrowUpRight, SquareArrowOutUpRight } from "lucide";
import { projectSurface, useThemeMode } from "@/lib/use-theme-mode";
import { cn } from "@/lib/utils";

export default function HeroFeaturedCard({
  project,
  badge,
  cardVariant,
  cardKey,
  className,
  style,
}) {
  const themeMode = useThemeMode();
  const surface = projectSurface(project, themeMode);
  const [hovered, setHovered] = useState(false);

  return (
    <motion.a
      variants={cardVariant}
      data-game-target
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
      data-cuelume-hover="tick"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-3xl p-6 glass-card-gradient",
        className,
      )}
      style={style}
    >
      <div
        className={cn("absolute inset-0 bg-gradient-to-br transition-all duration-500", surface.gradient)}
        style={{
          filter: hovered ? "brightness(1.08)" : undefined,
        }}
      />
      <div
        className="absolute inset-0 opacity-30 transition-opacity duration-500 group-hover:opacity-40"
        style={{
          background: `radial-gradient(ellipse at top right, ${surface.accent}33, transparent 60%)`,
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(255,255,255,0.08),transparent_55%)]" />

      <div className="relative flex items-start justify-between">
        <span
          className="font-mono text-xs uppercase tracking-widest"
          style={{ color: `${surface.accent}cc` }}
        >
          {badge}
        </span>
        <MorphIcon
          icon={hovered ? SquareArrowOutUpRight : ArrowUpRight}
          size={16}
          color={surface.accent}
          spring="snappy"
          className="transition-opacity group-hover:opacity-100"
        />
      </div>

      <div className="relative">
        <p className="text-2xl font-bold text-white md:text-3xl">{project.title}</p>
        <p className="mt-1 text-xs" style={{ color: `${surface.accent}bb` }}>
          {project.subtitle}
          {project.tags?.length ? ` · ${project.tags.slice(0, 3).join(" · ")}` : ""}
        </p>
      </div>
    </motion.a>
  );
}
