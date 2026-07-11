"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import VibeEasterEgg from "./vibe-easter-egg";
import EmojiDayEasterEgg from "./emoji-day-easter-egg";

const projects = [
  {
    title: "Emoji of the Day",
    subtitle: "Mood Tracker & Easter Egg",
    description:
      "A single-page mood tracker that assigns you a daily emoji and a hilariously unscientific diagnosis. Date-seeded results, a 30-day history, a slot-machine randomizer, and a secret easter egg for the curious. Zero dependencies.",
    tags: ["Vanilla JS", "CSS", "View Transitions", "i18n"],
    url: "https://emoji-day-hm.vercel.app/",
    year: "2026",
    category: "Fun",
    accent: "#FACC15",
    gradient: "from-yellow-950 via-amber-900 to-orange-900/60",
    preview: {
      bar: "emoji-day-hm.vercel.app",
      lines: ["70%", "55%", "80%", "65%"],
      btnColor: "#FACC15",
    },
  },
  {
    title: "Cantera Diez Hotel",
    subtitle: "Hotel & Hospitality",
    description:
      "Elegant digital presence for a boutique hotel in Morelia. Built with AngularJS & Firebase, featuring i18n bilingual support, room showcasing, and a seamless contact experience.",
    tags: ["AngularJS", "Firebase", "i18n", "SEO"],
    url: "https://canteradiezhotel.com",
    year: "2025",
    category: "Hospitality",
    accent: "#D97706",
    gradient: "from-amber-950 via-stone-900 to-amber-900/60",
    preview: {
      bar: "canteradiezhotel.com",
      lines: ["85%", "100%", "70%", "55%"],
      btnColor: "#D97706",
    },
  },
  {
    title: "Vibe Theme",
    subtitle: "VS Code Theme Collection",
    description:
      "8 premium dark themes for VS Code & Cursor. Built from scratch with deliberate contrast ratios and full TextMate grammar coverage. MIT licensed, free forever.",
    tags: ["Design", "VS Code", "Color Theory", "Branding"],
    url: "https://vibetheme.hectormendoza.me/",
    year: "2026",
    category: "Design Tool",
    accent: "#D946EF",
    gradient: "from-violet-950 via-fuchsia-950 to-purple-900/60",
    preview: {
      bar: "vibetheme.hectormendoza.me",
      lines: ["90%", "75%", "85%", "60%"],
      btnColor: "#D946EF",
    },
  },
  {
    title: "Astes",
    subtitle: "Corporate Website",
    description:
      "Clean, conversion-focused corporate site for a professional services company. Fast-loading, SEO-optimized, and built to generate qualified leads.",
    tags: ["WordPress", "PHP", "SEO", "UI Design"],
    url: "https://astes.com.mx/",
    year: "2024",
    category: "Corporate",
    accent: "#0EA5E9",
    gradient: "from-sky-950 via-slate-900 to-cyan-900/60",
    preview: {
      bar: "astes.com.mx",
      lines: ["100%", "80%", "65%", "90%"],
      btnColor: "#0EA5E9",
    },
  },
  {
    title: "Mojito Cocktails",
    subtitle: "GSAP Animation Showcase",
    description:
      "An immersive cocktail experience featuring scroll-driven animations, 3D perspective transforms, and silky liquid physics — all in the browser.",
    tags: ["GSAP", "Next.js", "CSS Animations", "WebGL"],
    url: "https://gsap-cocktails-hm.vercel.app/",
    year: "2026",
    category: "Creative Dev",
    accent: "#10B981",
    gradient: "from-emerald-950 via-green-900 to-teal-900/60",
    preview: {
      bar: "gsap-cocktails-hm.vercel.app",
      lines: ["75%", "95%", "80%", "70%"],
      btnColor: "#10B981",
    },
  },
  {
    title: "Milestone Massage Therapy",
    subtitle: "Wellness & Therapeutic Massage",
    description:
      "Therapeutic and prenatal massage studio in Spanish Fork, Utah. Built on WordPress with Vagaro booking integration, mobile in-home service info, and a membership program.",
    tags: ["WordPress", "PHP", "Booking", "SEO"],
    url: "https://milestonemassage.com/",
    year: "2025",
    category: "Wellness",
    accent: "#E8844C",
    gradient: "from-orange-950 via-stone-900 to-amber-900/60",
    preview: {
      bar: "milestonemassage.com",
      lines: ["85%", "70%", "60%", "90%"],
      btnColor: "#E8844C",
    },
  },
  {
    title: "Michoacán Auto",
    subtitle: "Tire Shop & Auto Repair",
    description:
      "Bilingual WordPress site for a family-owned tire shop and repair facility in Las Vegas, with appointment booking, financing details, and a tire brand directory.",
    tags: ["WordPress", "PHP", "Bilingual", "SEO"],
    url: "https://michoacanautolv.com/",
    year: "2025",
    category: "Automotive",
    accent: "#DC2626",
    gradient: "from-red-950 via-neutral-900 to-red-900/60",
    preview: {
      bar: "michoacanautolv.com",
      lines: ["90%", "75%", "65%", "80%"],
      btnColor: "#DC2626",
    },
  },
  {
    title: "Our Wedding",
    subtitle: "Personal Project · ♡",
    description:
      "A personal milestone: a custom wedding website built with love. RSVP management, countdown timer, event details, and a touch of magic for the big day.",
    tags: ["Next.js", "Tailwind CSS", "Design", "RSVP"],
    url: "http://wedding.hectormendoza.me/",
    year: "2025",
    category: "Personal",
    accent: "#F43F5E",
    gradient: "from-rose-950 via-pink-900 to-rose-900/60",
    preview: {
      bar: "wedding.hectormendoza.me",
      lines: ["80%", "65%", "90%", "55%"],
      btnColor: "#F43F5E",
    },
  },
];

const FILTERS = [
  { label: "Recent",      value: "recent" },
  { label: "All",         value: "all" },
  { label: "Hospitality", value: "Hospitality" },
  { label: "Design Tool", value: "Design Tool" },
  { label: "Corporate",   value: "Corporate" },
  { label: "Creative Dev",value: "Creative Dev" },
  { label: "Wellness",    value: "Wellness" },
  { label: "Automotive",  value: "Automotive" },
  { label: "Personal",    value: "Personal" },
  { label: "Fun",         value: "Fun" },
];

function ProjectPreview({ project, hovered }) {
  const isVibe = project.title === "Vibe Theme";
  const isEmojiDay = project.title === "Emoji of the Day";

  return (
    <div className={`relative aspect-[16/10] overflow-hidden rounded-t-2xl bg-gradient-to-br ${project.gradient}`}>
      {/* Vibe Theme rainbow overlay */}
      {isVibe && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-500"
          style={{ opacity: hovered ? 1 : 0 }}
        >
          <div className="vibe-rainbow-glow absolute inset-0" />
        </div>
      )}

      {/* Emoji of the Day floating emoji overlay */}
      {isEmojiDay && (
        <div
          className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden text-4xl transition-opacity duration-500"
          style={{ opacity: hovered ? 1 : 0 }}
        >
          <span className="animate-bounce">🎉</span>
        </div>
      )}

      {/* Mock browser chrome */}
      <div className="absolute inset-3 rounded-xl overflow-hidden border border-white/10 bg-black/30 backdrop-blur-sm flex flex-col">
        {/* Title bar */}
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5 shrink-0">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
          <div className="mx-3 flex-1 rounded-full bg-white/10 px-3 py-1">
            <span className="font-mono text-[10px] text-white/40 truncate block">{project.preview.bar}</span>
          </div>
        </div>
        {/* Page skeleton */}
        <div className="flex-1 p-4 space-y-2.5">
          <div className="h-3 rounded-full bg-white/25" style={{ width: project.preview.lines[0] }} />
          <div className="h-2 rounded-full bg-white/12" style={{ width: project.preview.lines[1] }} />
          <div className="h-2 rounded-full bg-white/12" style={{ width: project.preview.lines[2] }} />
          <div className="mt-4 flex gap-2">
            <div className="h-7 w-24 rounded-lg" style={{ background: project.accent + "90" }} />
            <div className="h-7 w-16 rounded-lg bg-white/10" />
          </div>
          <div className="mt-2 h-2 rounded-full bg-white/10" style={{ width: project.preview.lines[3] }} />
        </div>
      </div>

      {/* Accent glow */}
      <div
        className="absolute -bottom-8 left-1/2 -translate-x-1/2 h-24 w-48 rounded-full blur-2xl opacity-50 pointer-events-none transition-all duration-500"
        style={{
          background: isVibe && hovered
            ? "linear-gradient(90deg, #4C1D95, #7C3AED, #D946EF, #EC4899, #22D3EE, #818CF8)"
            : isEmojiDay && hovered
            ? "linear-gradient(90deg, #FACC15, #FB923C, #F472B6, #FACC15)"
            : project.accent,
        }}
      />
    </div>
  );
}

function ProjectCard({ project, index, onVibeHover, onEmojiDayHover }) {
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
    <motion.div
      layout
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30, scale: 0.97 }}
      transition={{ duration: 0.5, delay: index * 0.07 }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className="group"
    >
      <div
        className="overflow-hidden rounded-2xl glass-card transition-all duration-300 hover:shadow-2xl"
        style={{
          borderColor: hovered ? project.accent + "44" : undefined,
          boxShadow: hovered ? `0 24px 60px ${project.accent}18` : undefined,
        }}
      >
        {/* no border ring for Vibe — easter egg handles the magic */}

        {/* Preview */}
        <div className="relative">
          <ProjectPreview project={project} hovered={hovered} />

          {/* Hover overlay */}
          <motion.div
            animate={{ opacity: hovered ? 1 : 0 }}
            className="absolute inset-0 flex items-center justify-center"
            style={{
              background: `radial-gradient(ellipse at center, ${project.accent}30 0%, rgba(0,0,0,0.55) 100%)`,
              backdropFilter: "blur(4px)",
            }}
          >
            <motion.a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              animate={{ scale: hovered ? 1 : 0.8, opacity: hovered ? 1 : 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-2.5 rounded-full px-7 py-3 text-sm font-bold text-white"
              style={{
                background: project.accent,
                boxShadow: `0 8px 30px ${project.accent}70, 0 0 0 1px ${project.accent}40`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              Visit Site
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
              </svg>
            </motion.a>
          </motion.div>

          {/* Category badge */}
          <div className="absolute top-6 left-6 z-10">
            <span className="rounded-full bg-background/70 backdrop-blur-sm px-3 py-1.5 font-mono text-xs text-foreground/80 border border-white/10">
              {project.category}
            </span>
          </div>
          <div className="absolute top-6 right-6 z-10">
            <span className="font-mono text-xs text-white/50">{project.year}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          <h3 className="mb-1 text-xl font-bold text-foreground sm:text-2xl">{project.title}</h3>
          <p className="mb-3 text-sm font-semibold" style={{ color: project.accent }}>{project.subtitle}</p>
          <p className="mb-5 text-sm leading-relaxed text-muted-foreground">{project.description}</p>
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors group-hover:border-primary/25 group-hover:text-primary/80"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function ProjectsSection() {
  const [activeFilter, setActiveFilter] = useState("recent");
  const [vibeHovered, setVibeHovered] = useState(false);
  const [emojiDayHovered, setEmojiDayHovered] = useState(false);

  const filteredProjects = useMemo(() => {
    if (activeFilter === "recent") {
      return [...projects].sort((a, b) => parseInt(b.year) - parseInt(a.year));
    }
    if (activeFilter === "all") {
      return projects;
    }
    return projects.filter((p) => p.category === activeFilter);
  }, [activeFilter]);

  return (
    <section id="projects" className="relative py-16 md:py-32 bg-background/90">
      <VibeEasterEgg active={vibeHovered} />
      <EmojiDayEasterEgg active={emojiDayHovered} />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-64 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 -right-64 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-12 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end"
        >
          <div>
            <span className="mb-4 inline-block font-mono text-xs uppercase tracking-widest text-primary">
              Projects
            </span>
            <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              <span className="text-balance block">
                {"Featured "}
                <span className="text-gradient">work</span>
              </span>
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            {"Real projects. Real clients. Crafted with care — from hotel websites to animated cocktail showcases."}
          </p>
        </motion.div>

        {/* Filter pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-10 flex flex-wrap gap-2"
        >
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setActiveFilter(f.value)}
              className={`rounded-full px-4 py-1.5 font-mono text-xs transition-all duration-200 ${
                activeFilter === f.value
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "border border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary"
              }`}
            >
              {f.label}
            </button>
          ))}
        </motion.div>

        {/* Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFilter}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid gap-8 md:grid-cols-2"
          >
            {filteredProjects.map((project, i) => (
              <ProjectCard
                key={project.title}
                project={project}
                index={i}
                onVibeHover={project.title === "Vibe Theme" ? setVibeHovered : undefined}
                onEmojiDayHover={project.title === "Emoji of the Day" ? setEmojiDayHovered : undefined}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="mb-4 text-sm text-muted-foreground">Have a project in mind?</p>
          <a
            href="#contact"
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
