"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import VibeEasterEgg from "./vibe-easter-egg";
import EmojiDayEasterEgg from "./emoji-day-easter-egg";
import ProjectCardSwipe from "./project-card-swipe";
import ProjectsDesktopGallery from "./projects-desktop-gallery";
import ProjectFilterTabs from "./project-filter-tabs";
import { filterProjects } from "@/lib/projects";
import { ArrowFillButton } from "@/components/block/arrow-fill-button";

export default function ProjectsSection() {
  const [activeFilter, setActiveFilter] = useState("recent");
  const [vibeHovered, setVibeHovered] = useState(false);
  const [emojiDayHovered, setEmojiDayHovered] = useState(false);

  const filteredProjects = useMemo(
    () => filterProjects(activeFilter),
    [activeFilter],
  );

  return (
    <section id="projects" className="relative overflow-x-clip py-10 md:py-32">
      <VibeEasterEgg active={vibeHovered} />
      <EmojiDayEasterEgg active={emojiDayHovered} />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-64 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 -right-64 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-6 flex flex-col items-start justify-between gap-4 sm:mb-10 sm:gap-6 sm:flex-row sm:items-end"
        >
          <div>
            <span className="mb-3 inline-block font-mono text-xs uppercase tracking-widest text-primary sm:mb-4">
              Projects
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              <span className="block text-balance">
                {"All "}
                <span className="text-gradient">work</span>
              </span>
            </h2>
          </div>
          <p className="hidden max-w-md text-sm leading-relaxed text-muted-foreground sm:block">
            Every build in one place — client sites, experiments, and tools. Filter by category, then browse the full collection.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8 sm:mb-10"
        >
          <ProjectFilterTabs activeFilter={activeFilter} onChange={setActiveFilter} />
        </motion.div>

        <AnimatePresence mode="wait">
          {filteredProjects.length > 0 ? (
            <motion.div
              key={activeFilter}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <ProjectCardSwipe projects={filteredProjects} />

              <ProjectsDesktopGallery
                projects={filteredProjects}
                activeFilter={activeFilter}
                onVibeHover={setVibeHovered}
                onEmojiDayHover={setEmojiDayHovered}
              />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl border border-dashed border-border bg-card/60 px-6 py-12 text-center"
            >
              <p className="mb-2 font-mono text-xs uppercase tracking-widest text-primary">
                No matches
              </p>
              <p className="text-sm text-muted-foreground">
                Nothing in this category yet. Try Recent or All to browse the full collection.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 text-center sm:mt-16"
        >
          <p className="mb-4 text-sm text-muted-foreground">Have a project in mind?</p>
          <ArrowFillButton
            href="#contact"
            data-cuelume-press
            data-cuelume-release
            bgColor="hsl(var(--primary))"
            textColor="hsl(var(--primary-foreground))"
            fillBgColor="hsl(var(--background))"
            fillTextColor="hsl(var(--primary))"
            hoverFillBgColor="hsl(var(--card))"
            hoverFillTextColor="hsl(var(--primary))"
          >
            Let&apos;s build it together
          </ArrowFillButton>
        </motion.div>
      </div>
    </section>
  );
}
