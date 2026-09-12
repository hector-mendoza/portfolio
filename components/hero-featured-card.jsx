"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MorphIcon } from "morphicons/react";
import { ArrowUpRight, SquareArrowOutUpRight } from "lucide";
import { projectSurface } from "@/lib/use-theme-mode";
import { cn } from "@/lib/utils";
import GlareHover from "@/components/GlareHover";

export default function HeroFeaturedCard({
  project,
  badge,
  cardVariant,
  cardKey,
  className,
  style,
}) {
  const surface = projectSurface(project);
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
        "group relative flex flex-col justify-between overflow-hidden rounded-3xl glass-card-gradient",
        className,
      )}
      style={style}
    >
      <GlareHover
        overlay
        borderRadius="1.5rem"
        glareColor="#ffffff"
        glareOpacity={0.35}
        className="flex h-full min-h-[inherit] flex-col justify-between p-6"
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
      </GlareHover>
    </motion.a>
  );
}
