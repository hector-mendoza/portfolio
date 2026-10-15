"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { publishedStudies } from "@/content/case-studies";
import { projects } from "@/lib/projects";
import { caseStudyViewTransitionName } from "@/components/transition/RouteTransition";
import styles from "./portfolio-home.module.css";

function formatPeriod(period) {
  const end = period.end === "present" ? "Now" : period.end;
  return `${period.start}—${end}`;
}

export default function HomeWorkList() {
  let index = 0;

  return (
    <div className={styles.projectList}>
      {publishedStudies.map((study) => {
        index += 1;
        const slug = study.slug;
        const number = String(index).padStart(2, "0");
        const meta = `${study.org} · ${formatPeriod(study.period)}`;

        return (
          <Link
            key={slug}
            href={`/work/${slug}`}
            className={styles.project}
            style={{ viewTransitionName: caseStudyViewTransitionName(slug) }}
          >
            <span className={styles.projectNumber}>{number}</span>
            <span className={styles.projectTitle}>
              <strong>{study.title}</strong>
              <small>{study.summary}</small>
            </span>
            <span className={styles.projectMeta}>{meta}</span>
            <ArrowUpRight aria-hidden="true" />
          </Link>
        );
      })}

      <p className={styles.moreWorkLabel}>More work</p>

      {projects.map((project) => {
        index += 1;
        return (
          <a
            className={styles.project}
            href={project.url}
            key={project.title}
            target="_blank"
            rel="noreferrer"
          >
            <span className={styles.projectNumber}>
              {String(index).padStart(2, "0")}
            </span>
            <span className={styles.projectTitle}>
              <strong>{project.title}</strong>
              <small>{project.subtitle}</small>
            </span>
            <span className={styles.projectMeta}>
              {project.category} · {project.year}
            </span>
            <ArrowUpRight aria-hidden="true" />
          </a>
        );
      })}
    </div>
  );
}
