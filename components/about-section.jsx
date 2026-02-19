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

  const logoMaskSize = useTransform(scrollYProgress, [0, 0.55], ["10%", "145%"]);
  const maskedImageOpacity = useTransform(scrollYProgress, [0, 0.62, 0.85], [1, 1, 0]);
  const fullImageOpacity = useTransform(scrollYProgress, [0.55, 0.85], [0, 1]);
  const imageScale = useTransform(scrollYProgress, [0, 0.5], [1.3, 1]);
  const parallaxY = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const rotateX = useTransform(scrollYProgress, [0, 0.3], [15, 0]);
  const sectionOpacity = useTransform(scrollYProgress, [0, 0.15], [0, 1]);

  return (
    <section
      id="about"
      ref={containerRef}
      className="relative py-32 overflow-hidden"
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
          className="mb-20"
        >
          <motion.span variants={fadeSlideUp} className="mb-4 inline-block font-mono text-xs uppercase tracking-[0.3em] text-primary">
            01 / About
          </motion.span>
          <motion.h2 variants={fadeSlideUp} className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-7xl">
            <span className="block text-balance">
              {"A bit about "}
              <span className="text-gradient">me</span>
            </span>
          </motion.h2>
        </motion.div>

        <div className="grid items-start gap-16 lg:grid-cols-2">
          {/* Image with mask reveal + perspective */}
          <motion.div
            className="relative"
            style={{ perspective: "1000px" }}
          >
            <motion.div
              style={{
                rotateX,
              }}
              className="relative overflow-hidden rounded-2xl"
            >
              <motion.div
                style={{ scale: imageScale }}
                className="aspect-[4/5] relative overflow-hidden"
              >
                <motion.img
                  src="/cartoon-tech-profile.webp"
                  alt="Hector Mendoza"
                  style={{ opacity: fullImageOpacity }}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <motion.img
                  src="/cartoon-tech-profile.webp"
                  alt="Hector Mendoza"
                  style={{
                    opacity: maskedImageOpacity,
                    WebkitMaskImage: "url('/apple-logo.png')",
                    maskImage: "url('/apple-logo.png')",
                    WebkitMaskRepeat: "no-repeat",
                    maskRepeat: "no-repeat",
                    WebkitMaskPosition: "center",
                    maskPosition: "center",
                    WebkitMaskSize: logoMaskSize,
                    maskSize: logoMaskSize,
                  }}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 }}
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center hidden md:block"
                >
                  <p className="font-mono text-sm text-primary">
                    Morelia, Mexico
                  </p>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5, x: 30, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, x: 30, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="hidden sm:block absolute -right-4 -bottom-4 rounded-xl border border-border bg-card p-4 shadow-2xl shadow-primary/5 sm:-right-8 sm:-bottom-8"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{"Master's Degree"}</p>
                  <p className="text-xs text-muted-foreground">Computer Science</p>
                </div>
              </div>
            </motion.div>
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
                {"I'm a "}
                <span className="text-foreground font-medium">Senior Software Engineer</span>
                {" based in Morelia, Mexico, with over 8 years of experience building digital products that make an impact. I specialize in creating performant, accessible, and visually stunning web applications."}
              </motion.p>
              <motion.p variants={fadeSlideUp} className="mb-6 text-lg leading-relaxed text-muted-foreground">
                {"From leading the web team at "}
                <span className="text-foreground font-medium">Once Interactive</span>
                {" where I worked with 100+ international companies, to earning my Master's degree in Computer Science with a focus on Mobile App Development, I bring both depth and breadth to every project."}
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
                  whileHover={{ scale: 1.05, borderColor: "hsl(24 85% 62% / 0.5)" }}
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
                    whileHover={{ scale: 1.1, backgroundColor: "hsl(24 85% 62% / 0.15)" }}
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
      <div className="mt-32 overflow-hidden border-y border-border bg-card/50 py-5">
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
