"use client";

import { motion } from "framer-motion";
import { EffectCards, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-cards";
import "swiper/css/pagination";
import { Link001 } from "@/components/ui/skiper-ui/skiper40";
import { cn } from "@/lib/utils";

/**
 * Project card-swipe deck adapted from Skiper UI skiper48 (Swiper EffectCards).
 * Attribution: Skiper UI — https://skiper-ui.com · Swiper.js
 */
export default function ProjectCardSwipe({ projects, className }) {
  if (!projects?.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative mx-auto mb-10 flex w-full max-w-lg flex-col items-center sm:mb-14",
        className,
      )}
    >
      <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        Swipe the stack
      </p>

      <style>{`
        .project-card-swipe {
          padding-bottom: 2.5rem !important;
          overflow: visible;
        }
        .project-card-swipe .swiper-slide {
          border-radius: 1.25rem;
          overflow: hidden;
        }
        .project-card-swipe .swiper-pagination-bullet {
          background: hsl(var(--muted-foreground));
          opacity: 0.35;
        }
        .project-card-swipe .swiper-pagination-bullet-active {
          background: hsl(var(--primary));
          opacity: 1;
        }
      `}</style>

      <Swiper
        effect="cards"
        grabCursor
        pagination={{ clickable: true }}
        className="project-card-swipe h-[360px] w-[260px] sm:h-[400px] sm:w-[300px]"
        modules={[EffectCards, Pagination]}
      >
        {projects.map((project) => (
          <SwiperSlide key={project.title} className="rounded-3xl">
            <div
              className={cn(
                "relative flex h-full w-full flex-col justify-between overflow-hidden bg-gradient-to-br p-6",
                project.gradient,
              )}
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.12),transparent_55%)]" />
              <div className="relative flex items-start justify-between gap-3">
                <span className="rounded-full border border-white/15 bg-black/25 px-2.5 py-1 font-mono text-[10px] text-white/80 backdrop-blur-sm">
                  {project.category}
                </span>
                <span className="font-mono text-[10px] text-white/50">
                  {project.year}
                </span>
              </div>

              <div className="relative space-y-3">
                <div>
                  <h3 className="text-2xl font-bold tracking-tight text-white">
                    {project.title}
                  </h3>
                  <p className="mt-1 text-sm font-medium" style={{ color: project.accent }}>
                    {project.subtitle}
                  </p>
                </div>
                <p className="line-clamp-3 text-xs leading-relaxed text-white/70">
                  {project.description}
                </p>
                <Link001
                  href={project.url}
                  className="w-fit text-sm font-semibold text-white"
                >
                  Visit site
                </Link001>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </motion.div>
  );
}
