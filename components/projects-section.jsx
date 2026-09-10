"use client";

import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import VibeEasterEgg from "./vibe-easter-egg";
import EmojiDayEasterEgg from "./emoji-day-easter-egg";
import ProjectsHorizontalRail from "./projects-horizontal-rail";
import { PROJECT_FILTERS, filterProjects } from "@/lib/projects";

export default function ProjectsSection() {
  const [activeFilter, setActiveFilter] = useState("recent");
  const [vibeHovered, setVibeHovered] = useState(false);
  const [emojiDayHovered, setEmojiDayHovered] = useState(false);

  const filteredProjects = useMemo(
    () => filterProjects(activeFilter),
    [activeFilter],
  );

  return (
    <section id="projects" className="relative py-10 md:py-32">
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
            Every build in one place — client sites, experiments, and tools. Filter by category or scroll the full collection.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="-mx-6 mb-6 flex gap-2 overflow-x-auto px-6 pb-1 [scrollbar-width:none] sm:mx-0 sm:mb-8 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden"
        >
          {PROJECT_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              data-cuelume-toggle
              onClick={() => setActiveFilter(f.value)}
              className={`shrink-0 rounded-full px-4 py-1.5 font-mono text-xs transition-all duration-200 ${
                activeFilter === f.value
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "border border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary"
              }`}
            >
              {f.label}
            </button>
          ))}
        </motion.div>

        <ProjectsHorizontalRail
          projects={filteredProjects}
          activeFilter={activeFilter}
          onVibeHover={setVibeHovered}
          onEmojiDayHover={setEmojiDayHovered}
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 text-center sm:mt-16"
        >
          <p className="mb-4 text-sm text-muted-foreground">Have a project in mind?</p>
          <a
            href="#contact"
            data-cuelume-press
            data-cuelume-release
            className="group inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground transition-all hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
          >
            {"Let's build it together"}
            <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
