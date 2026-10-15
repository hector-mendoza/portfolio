"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { CaseStudy } from "@/content/schema";
import SpotlightCard from "@/components/SpotlightCard";
import Magnet from "@/components/Magnet";
import MotionGate from "@/components/motion-gate";
import Aurora from "@/components/Aurora";
import styles from "./case-study-card.module.css";

type CaseStudyCardProps = {
  study: CaseStudy;
  index: number;
};

function StaticCardBody({ study, index }: CaseStudyCardProps) {
  return (
    <article
      className={styles.card}
      style={{ "--study-accent": study.accent } as CSSProperties}
    >
      <div className={styles.mediaStatic} aria-hidden="true" />
      <div className={styles.body}>
        <span className={styles.index}>{String(index + 1).padStart(2, "0")}</span>
        <p className={styles.eyebrow}>
          {study.category} · {study.year}
        </p>
        <h3 className={styles.title}>{study.title}</h3>
        <p className={styles.subtitle}>{study.subtitle}</p>
        <p className={styles.summary}>{study.summary}</p>
        <span className={styles.cta}>
          Read case study
          <ArrowUpRight aria-hidden size={16} />
        </span>
      </div>
    </article>
  );
}

function MotionCardBody({ study, index }: CaseStudyCardProps) {
  return (
    <SpotlightCard
      className={styles.card}
      spotlightColor={`${study.accent}33`}
    >
      <article style={{ "--study-accent": study.accent } as CSSProperties}>
        <div className={styles.media} aria-hidden="true">
          <Aurora
            colorStops={[study.accent, "#050505", study.accent]}
            amplitude={0.65}
            blend={0.82}
            speed={0.35}
          />
        </div>
        <div className={styles.body}>
          <span className={styles.index}>{String(index + 1).padStart(2, "0")}</span>
          <p className={styles.eyebrow}>
            {study.category} · {study.year}
          </p>
          <h3 className={styles.title}>{study.title}</h3>
          <p className={styles.subtitle}>{study.subtitle}</p>
          <p className={styles.summary}>{study.summary}</p>
          <span className={styles.cta}>
            Read case study
            <ArrowUpRight aria-hidden size={16} />
          </span>
        </div>
      </article>
    </SpotlightCard>
  );
}

export default function CaseStudyCard({ study, index }: CaseStudyCardProps) {
  return (
    <Link href={`/work/${study.slug}`} className={styles.link}>
      <MotionGate
        motion={
          <Magnet padding={72} magnetStrength={2.5} wrapperClassName={styles.magnet}>
            <MotionCardBody study={study} index={index} />
          </Magnet>
        }
        fallback={<StaticCardBody study={study} index={index} />}
      />
    </Link>
  );
}
