"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import Image from "next/image";

const projects = [
  {
    title: "E-Commerce Platform",
    subtitle: "Shopify & Custom Integration",
    description:
      "A full-featured e-commerce solution built on Shopify with custom theme development, advanced filtering, and seamless checkout flow. Increased client revenue by 40%.",
    tags: ["Shopify", "Liquid", "JavaScript", "CSS"],
    image: "/images/project-ecommerce.jpg",
    year: "2023",
    category: "E-Commerce",
  },
  {
    title: "Corporate Website Redesign",
    subtitle: "Next.js & Headless CMS",
    description:
      "Complete redesign and rebuild of a Fortune 500 company's web presence. Implemented headless CMS architecture with Next.js for blazing-fast performance.",
    tags: ["Next.js", "TypeScript", "Tailwind", "Sanity"],
    image: "/images/project-corporate.jpg",
    year: "2022",
    category: "Corporate",
  },
  {
    title: "Analytics Dashboard",
    subtitle: "React & Real-time Data",
    description:
      "Interactive analytics dashboard with real-time data visualization, custom charting, and comprehensive reporting tools for a SaaS product.",
    tags: ["React", "D3.js", "Node.js", "PostgreSQL"],
    image: "/images/project-webapp.jpg",
    year: "2022",
    category: "Web App",
  },
  {
    title: "Fitness Mobile App",
    subtitle: "React Native & Cloud",
    description:
      "Cross-platform mobile application for fitness tracking with workout planning, progress visualization, and social features.",
    tags: ["React Native", "Firebase", "TypeScript", "Expo"],
    image: "/images/project-mobile.jpg",
    year: "2021",
    category: "Mobile",
  },
];

function ProjectCard({ project, index }) {
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const imageScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.3, 1, 1.1]);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 80 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay: index * 0.1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group"
    >
      <div className="overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5">
        {/* Image container with mask effect */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <motion.div style={{ scale: imageScale }} className="h-full w-full">
            <Image
              src={project.image || "/placeholder.svg"}
              alt={project.title}
              fill
              className="object-cover transition-all duration-700"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </motion.div>

          {/* Overlay */}
          <motion.div
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center"
          >
            <motion.div
              animate={{ scale: isHovered ? 1 : 0.8, opacity: isHovered ? 1 : 0 }}
              className="flex items-center gap-3 rounded-full border border-primary bg-primary/10 px-6 py-3 text-sm font-semibold text-primary"
            >
              View Project
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
                />
              </svg>
            </motion.div>
          </motion.div>

          {/* Category badge */}
          <div className="absolute top-4 left-4 z-10">
            <span className="rounded-full bg-background/80 backdrop-blur-sm px-3 py-1.5 font-mono text-xs text-foreground">
              {project.category}
            </span>
          </div>

          {/* Year badge */}
          <div className="absolute top-4 right-4 z-10">
            <span className="font-mono text-xs text-foreground/60">
              {project.year}
            </span>
          </div>
        </div>

        {/* Content */}
        <motion.div style={{ y: useTransform(y, (v) => v * 0.1) }} className="p-6 sm:p-8">
          <h3 className="mb-1 text-xl font-bold text-foreground sm:text-2xl">
            {project.title}
          </h3>
          <p className="mb-3 text-sm font-medium text-primary">
            {project.subtitle}
          </p>
          <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
            {project.description}
          </p>
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors group-hover:border-primary/30 group-hover:text-primary"
              >
                {tag}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function ProjectsSection() {
  const sectionRef = useRef(null);

  return (
    <section id="projects" ref={sectionRef} className="relative py-32">
      {/* Background accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-64 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 -right-64 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end"
        >
          <div>
            <span className="mb-4 inline-block font-mono text-xs uppercase tracking-widest text-primary">
              03 / Projects
            </span>
            <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              <span className="text-balance block">
                {"Featured "}
                <span className="text-gradient">work</span>
              </span>
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            {"A selection of projects I've built for clients across various industries. Each one crafted with attention to detail and performance."}
          </p>
        </motion.div>

        {/* Projects Grid */}
        <div className="grid gap-8 md:grid-cols-2">
          {projects.map((project, i) => (
            <ProjectCard key={project.title} project={project} index={i} />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="mb-4 text-sm text-muted-foreground">
            Want to see more of my work?
          </p>
          <a
            href="#contact"
            className="group inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground transition-all hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
          >
            {"Let's discuss your project"}
            <svg
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
