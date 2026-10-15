"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { CaseStudy } from "@/content/schema";
import SpotlightCard from "@/components/SpotlightCard";
import Magnet from "@/components/Magnet";
import MotionGate from "@/components/motion-gate";
import Aurora from "@/components/Aurora";
import { cn } from "@/lib/utils";

type CaseStudyCardProps = {
  study: CaseStudy;
  index: number;
  className?: string;
};

function CardContent({
  study,
  index,
  withAurora,
}: CaseStudyCardProps & { withAurora: boolean }) {
  return (
    <article
      className={cn(
        "group relative flex h-full min-h-[320px] flex-col overflow-hidden rounded-3xl border border-border/80 bg-card/80 shadow-[0_20px_50px_hsl(var(--primary)/0.08)] backdrop-blur-sm transition-all duration-300",
        "hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_24px_60px_hsl(var(--primary)/0.14)]",
      )}
      style={{ "--study-accent": study.accent } as CSSProperties}
    >
      <div
        className="relative h-40 shrink-0 overflow-hidden border-b border-border/60"
        aria-hidden="true"
      >
        {withAurora ? (
          <Aurora
            colorStops={[study.accent, "hsl(var(--primary))", study.accent]}
            amplitude={0.65}
            blend={0.82}
            speed={0.35}
          />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background: `linear-gradient(135deg, color-mix(in srgb, ${study.accent} 35%, hsl(var(--card))), hsl(var(--primary) / 0.85))`,
            }}
          />
        )}
        <div className="absolute left-5 top-5 font-mono text-[10px] uppercase tracking-[0.24em] text-white/80">
          {String(index + 1).padStart(2, "0")}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5 sm:p-6">
        <span className="inline-flex w-fit rounded-full border border-border bg-secondary/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {study.category} · {study.year}
        </span>
        <h3 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          {study.title}
        </h3>
        <p className="text-sm font-medium" style={{ color: study.accent }}>
          {study.subtitle}
        </p>
        <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
          {study.summary}
        </p>
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
          Read case study
          <ArrowUpRight
            aria-hidden
            size={16}
            className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </span>
      </div>
    </article>
  );
}

export default function CaseStudyCard({ study, index, className }: CaseStudyCardProps) {
  return (
    <Link href={`/work/${study.slug}`} className={cn("block h-full", className)}>
      <MotionGate
        motion={
          <Magnet padding={72} magnetStrength={2.5} wrapperClassName="h-full">
            <SpotlightCard
              className="h-full rounded-3xl"
              spotlightColor={`${study.accent}33`}
            >
              <CardContent study={study} index={index} withAurora />
            </SpotlightCard>
          </Magnet>
        }
        fallback={<CardContent study={study} index={index} withAurora={false} />}
      />
    </Link>
  );
}
