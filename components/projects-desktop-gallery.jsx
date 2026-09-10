"use client";

import { useEffect, useRef, useState } from "react";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import ProjectGalleryCard from "@/components/project-gallery-card";
import { cn } from "@/lib/utils";

function ArrowIcon({ direction }) {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      {direction === "prev" ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      )}
    </svg>
  );
}

export default function ProjectsDesktopGallery({
  projects,
  activeFilter,
  onVibeHover,
  onEmojiDayHover,
  className,
}) {
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const swiperRef = useRef(null);
  const [index, setIndex] = useState(1);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const syncNav = (swiper) => {
    setIndex((swiper.realIndex ?? 0) + 1);
    setCanPrev(!swiper.isBeginning);
    setCanNext(!swiper.isEnd);
  };

  useEffect(() => {
    swiperRef.current?.slideTo(0, 0);
    setIndex(1);
  }, [activeFilter]);

  if (!projects?.length) return null;

  return (
    <div className={cn("hidden md:block", className)}>
      <div className="mb-5 flex items-center justify-between gap-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          {String(index).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
          <span className="mx-2 text-border">·</span>
          Drag or use arrows
        </p>
        <div className="flex items-center gap-2">
          <button
            ref={prevRef}
            type="button"
            aria-label="Previous projects"
            data-cuelume-press
            data-cuelume-release
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition-all",
              "hover:border-primary/50 hover:text-primary",
              !canPrev && "pointer-events-none opacity-30",
            )}
          >
            <ArrowIcon direction="prev" />
          </button>
          <button
            ref={nextRef}
            type="button"
            aria-label="Next projects"
            data-cuelume-press
            data-cuelume-release
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition-all",
              "hover:border-primary/50 hover:text-primary",
              !canNext && "pointer-events-none opacity-30",
            )}
          >
            <ArrowIcon direction="next" />
          </button>
        </div>
      </div>

      <Swiper
        key={activeFilter}
        modules={[Navigation]}
        slidesPerView={1.15}
        spaceBetween={20}
        grabCursor
        speed={520}
        breakpoints={{
          768: { slidesPerView: 1.45, spaceBetween: 22 },
          1024: { slidesPerView: 2.15, spaceBetween: 24 },
          1280: { slidesPerView: 2.45, spaceBetween: 24 },
        }}
        onBeforeInit={(swiper) => {
          swiper.params.navigation = {
            ...(typeof swiper.params.navigation === "object" ? swiper.params.navigation : {}),
            prevEl: prevRef.current,
            nextEl: nextRef.current,
          };
        }}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
          syncNav(swiper);
        }}
        onSlideChange={syncNav}
        className="projects-desktop-gallery overflow-hidden"
      >
        {projects.map((project, i) => (
          <SwiperSlide key={project.title} className="!h-auto">
            <ProjectGalleryCard
              project={project}
              index={i}
              onVibeHover={project.title === "Vibe Theme" ? onVibeHover : undefined}
              onEmojiDayHover={project.title === "Emoji of the Day" ? onEmojiDayHover : undefined}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
