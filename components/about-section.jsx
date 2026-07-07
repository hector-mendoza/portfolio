"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { fadeSlideUp, scaleIn, staggerContainer } from "@/lib/animations";

const stats = [
  { value: "8+", label: "Years Experience" },
  { value: "20+", label: "Projects Delivered" },
  { value: "10+", label: "Happy Clients" },
  { value: "3", label: "Countries" },
];

const techStack = [
  "Next.js", "React", "TypeScript", "WordPress", "Shopify",
  "Node.js", "Tailwind CSS", "Three.js", "GSAP", "Figma",
  "WooCommerce", "SEO",
];

export default function AboutSection() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const parallaxY = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const sectionOpacity = useTransform(scrollYProgress, [0, 0.15], [0, 1]);

  return (
    <section
      id="about"
      ref={containerRef}
      className="relative py-16 md:py-32 overflow-hidden bg-background/90"
    >
      {/* Horizontal scrolling background text */}
      <div className="absolute top-1/2 -translate-y-1/2 left-0 pointer-events-none overflow-hidden whitespace-nowrap opacity-[0.02]">
        <motion.div style={{ x: parallaxY }} className="flex gap-16">
          {[...Array(3)].map((_, i) => (
            <span key={i} className="text-[15vw] font-bold leading-none text-foreground">
              ABOUT ME ABOUT ME
            </span>
          ))}
        </motion.div>
      </div>

      <motion.div style={{ opacity: sectionOpacity }} className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="mb-10 md:mb-20"
        >
          <motion.span variants={fadeSlideUp} className="mb-4 inline-block font-mono text-xs uppercase tracking-[0.3em] text-primary">
            03 / About
          </motion.span>
          <motion.h2 variants={fadeSlideUp} className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-7xl">
            <span className="block text-balance">
              {"A bit about "}
              <span className="text-gradient">me</span>
            </span>
          </motion.h2>
        </motion.div>

        <div className="grid items-start gap-16 lg:grid-cols-2">
          {/* Avatar — Notion-style squircle */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex justify-center lg:justify-start"
          >
            <div className="relative">
              <div
                className="h-80 w-80 sm:h-96 sm:w-96 overflow-hidden bg-white shadow-2xl shadow-primary/10 border border-border/60"
                style={{ borderRadius: "32px" }}
              >
                <img
                  src="/404-face.png"
                  alt="Hector Mendoza"
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Floating badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 16 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="absolute -right-4 -bottom-4 rounded-xl border border-border bg-card p-4 shadow-2xl shadow-primary/5 sm:-right-6 sm:-bottom-6"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{"Master's Degree"}</p>
                    <p className="text-xs text-muted-foreground">Computer Science</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Text Content */}
          <div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.p variants={fadeSlideUp} className="mb-6 text-lg leading-relaxed text-muted-foreground">
                {"I'm currently "}
                <span className="text-foreground font-medium">Head of Web Integrations at UrVenue</span>
                {", based in Morelia, Mexico. With over 8 years of experience I specialize in building performant, accessible, and visually polished web experiences."}
              </motion.p>
              <motion.p variants={fadeSlideUp} className="mb-6 text-lg leading-relaxed text-muted-foreground">
                {"Before UrVenue I led the web team at "}
                <span className="text-foreground font-medium">Once Interactive</span>
                {", collaborating with 50+ international companies across e-commerce, hospitality, and corporate sectors. I also hold a Master's degree in Computer Science with a focus on Mobile App Development."}
              </motion.p>
              <motion.p variants={fadeSlideUp} className="mb-10 text-lg leading-relaxed text-muted-foreground">
                {"My approach combines clean code with thoughtful design. I believe every pixel matters and every interaction should feel intentional."}
              </motion.p>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="mb-12 grid grid-cols-2 gap-4 sm:grid-cols-4"
            >
              {stats.map((stat) => (
                <motion.div
                  key={stat.label}
                  variants={scaleIn}
                  whileHover={{ scale: 1.05, borderColor: "hsl(160 65% 30% / 0.5)" }}
                  className="rounded-xl border border-border bg-card p-4 text-center transition-colors"
                >
                  <p className="text-2xl font-bold text-primary">{stat.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Tech Stack */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <p className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Tech Stack
              </p>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
                className="flex flex-wrap gap-2"
              >
                {techStack.map((tech) => (
                  <motion.span
                    key={tech}
                    variants={{
                      hidden: { opacity: 0, scale: 0.5 },
                      visible: { opacity: 1, scale: 1 },
                    }}
                    whileHover={{ scale: 1.1, backgroundColor: "hsl(160 65% 30% / 0.15)" }}
                    className="rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-all hover:border-primary/50 hover:text-primary cursor-default"
                  >
                    {tech}
                  </motion.span>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Marquee strip */}
      <div className="mt-16 md:mt-32 overflow-hidden border-y border-border bg-card/50 py-5">
        <div className="animate-marquee flex whitespace-nowrap">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-8 px-4">
              {["NEXT.JS", "REACT", "TYPESCRIPT", "WORDPRESS", "SHOPIFY", "NODE.JS", "TAILWIND", "THREE.JS", "GSAP", "FIGMA"].map((item) => (
                <span key={`${item}-${i}`} className="flex items-center gap-8 font-mono text-sm tracking-widest text-muted-foreground">
                  <span>{item}</span>
                  <span className="text-primary">{"///"}</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
