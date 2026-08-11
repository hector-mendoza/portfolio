"use client";

import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "lucide";
import { useState } from "react";
import { cn } from "@/lib/utils";

const STACK_PROJECTS = [
  {
    id: "agent-ready",
    title: "Agent Ready",
    subtitle: "AI Crawler Toolkit",
    description:
      "Makes your app readable by AI agents — robots.txt, llms.txt, MCP cards, and a live-site audit CLI.",
    url: "https://github.com/hector-mendoza/agent-ready",
    year: "2026",
    stack: "TypeScript",
    accent: "#EF4444",
    gradient: "from-red-950 via-orange-900 to-rose-900",
  },
  {
    id: "vibe-theme",
    title: "Vibe Theme",
    subtitle: "VS Code Themes",
    description:
      "Eight premium dark themes for VS Code & Cursor with deliberate contrast and full grammar coverage.",
    url: "https://vibetheme.hectormendoza.me/",
    year: "2026",
    stack: "Design",
    accent: "#D946EF",
    gradient: "from-violet-950 via-fuchsia-950 to-purple-900",
  },
  {
    id: "mojito",
    title: "Mojito Cocktails",
    subtitle: "GSAP Showcase",
    description:
      "Scroll-driven animations, 3D perspective, and liquid physics — all in the browser.",
    url: "https://gsap-cocktails-hm.vercel.app/",
    year: "2026",
    stack: "GSAP",
    accent: "#10B981",
    gradient: "from-emerald-950 via-green-900 to-teal-900",
  },
  {
    id: "cantera",
    title: "Cantera Diez",
    subtitle: "Boutique Hotel",
    description:
      "Elegant hospitality site with bilingual i18n, room showcases, and Firebase-backed booking flows.",
    url: "https://canteradiezhotel.com",
    year: "2025",
    stack: "AngularJS",
    accent: "#D97706",
    gradient: "from-amber-950 via-stone-900 to-amber-900",
  },
];

const CARD_WIDTH = 320;
const CARD_OVERLAP = 220;

function StackCard({ project, index, totalCards, isExpanded, reducedMotion, onOpen }) {
  const centerOffset = (totalCards - 1) * 5;
  const collapsed = {
    x: index * 10 - centerOffset,
    y: index * 2,
    rotate: reducedMotion ? 0 : index * 1.5,
    scale: 1,
  };

  const totalExpandedWidth = CARD_WIDTH + (totalCards - 1) * (CARD_WIDTH - CARD_OVERLAP);
  const expandedCenterOffset = totalExpandedWidth / 2;
  const expanded = {
    x: index * (CARD_WIDTH - CARD_OVERLAP) - expandedCenterOffset + CARD_WIDTH / 2,
    y: 0,
    rotate: reducedMotion ? 0 : index * 5 - (totalCards - 1) * 2.5,
    scale: 1,
  };

  return (
    <motion.div
      animate={{
        ...(isExpanded ? expanded : collapsed),
        zIndex: totalCards - index,
      }}
      className={cn(
        "absolute inset-0 w-full cursor-pointer overflow-hidden rounded-2xl border border-white/10 p-6",
        "glass-card shadow-2xl backdrop-blur-xl",
        "transition-[border-color,box-shadow] duration-300"
      )}
      initial={collapsed}
      style={{
        maxWidth: `${CARD_WIDTH}px`,
        left: "50%",
        marginLeft: `-${CARD_WIDTH / 2}px`,
      }}
      transition={
        reducedMotion
          ? { duration: 0.2, ease: "easeOut" }
          : {
              type: "spring",
              stiffness: 220,
              damping: 28,
              mass: 1,
              delay: isExpanded ? index * 0.05 : 0,
            }
      }
      onClick={(event) => {
        event.stopPropagation();
        if (isExpanded) onOpen(project.url);
      }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${project.gradient} opacity-90`} />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: `radial-gradient(ellipse at top right, ${project.accent}55, transparent 60%)`,
        }}
      />

      <div className="relative z-10">
        <dl className="mb-4 grid grid-cols-4 gap-2">
          {[
            { label: "Year", value: project.year },
            { label: "Stack", value: project.stack },
            { label: "Type", value: "Live" },
            { label: "Status", value: "Shipped" },
          ].map((spec) => (
            <div key={spec.label} className="flex flex-col text-[10px]">
              <dd className="font-semibold text-white/90">{spec.value}</dd>
              <dt className="font-mono uppercase tracking-wider text-white/50">{spec.label}</dt>
            </div>
          ))}
        </dl>

        <div
          className="relative mb-4 flex aspect-[16/10] items-end overflow-hidden rounded-xl border border-white/10 p-4"
          style={{ background: `${project.accent}22` }}
        >
          <span className="font-mono text-[10px] uppercase tracking-widest text-white/60">
            {project.subtitle}
          </span>
          {isExpanded && (
            <motion.span
              animate={{ opacity: 1, x: 0 }}
              className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 font-mono text-[10px] text-white/80"
              initial={{ opacity: 0, x: 8 }}
            >
              Open <ArrowUpRight size={12} />
            </motion.span>
          )}
        </div>

        <div className="space-y-1 text-left">
          <span className="block text-2xl font-bold tracking-tight text-white">{project.title}</span>
          <p className="text-sm leading-relaxed text-white/70">{project.description}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function ProjectCardStack({ className }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const reducedMotion = useReducedMotion() ?? false;

  const openProject = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className={cn("relative mb-12 md:mb-16", className)}>
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="mb-2 inline-block font-mono text-xs uppercase tracking-widest text-primary">
            Interactive
          </span>
          <h3 className="text-2xl font-bold text-foreground md:text-3xl">
            Tap the stack to explore
          </h3>
        </div>
        <p className="max-w-sm text-sm text-muted-foreground">
          {isExpanded
            ? "Tap any card to open the live project."
            : "Click once to fan out — your top builds, stacked and ready."}
        </p>
      </div>

      <button
        aria-expanded={isExpanded}
        aria-label={isExpanded ? "Collapse project stack" : "Expand project stack"}
        className={cn(
          "relative mx-auto flex min-h-[460px] w-full max-w-[90vw] cursor-pointer appearance-none items-center justify-center",
          "border-0 bg-transparent p-0 md:max-w-[1200px]"
        )}
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
      >
        {STACK_PROJECTS.map((project, index) => (
          <StackCard
            key={project.id}
            index={index}
            isExpanded={isExpanded}
            project={project}
            reducedMotion={reducedMotion}
            totalCards={STACK_PROJECTS.length}
            onOpen={openProject}
          />
        ))}
      </button>
    </div>
  );
}
