"use client";

import { Branches } from "@lucasmarkes/hairline/react";
import HairlineFigure from "@/components/hairline-figure";

const experiences = [
  {
    period: "2024 — Present",
    role: "Head of Web Integrations",
    company: "UrVenue",
    location: "Morelia, Mexico",
    description:
      "Leading web integrations strategy and delivery across the UrVenue platform.",
  },
  {
    period: "2023 — 2024",
    role: "Web Services Developer",
    company: "UrVenue",
    location: "Morelia, Mexico",
    description:
      "Built and maintained web services and client-facing venue technology experiences.",
  },
  {
    period: "2019 — 2023",
    role: "Office Manager & Lead Developer",
    company: "Once Interactive Inc.",
    location: "Remote",
    description:
      "Led the First-Line Web Team and Mexico office operations for 50+ international clients.",
  },
  {
    period: "2017 — 2023",
    role: "Senior Web Developer",
    company: "Once Interactive Inc.",
    location: "Remote",
    description:
      "Front-end development for e-commerce, hospitality, and corporate clients.",
  },
  {
    period: "2017",
    role: "Web Developer",
    company: "COPARMEX Michoacán",
    location: "Morelia, Mexico",
    description: "Maintained the confederation web platform.",
  },
];

const education = [
  {
    period: "2018 — 2020",
    degree: "M.S. Computer Science",
    school: "Universidad Vasco de Quiroga, A.C.",
    detail: "Mobile app development",
  },
  {
    period: "2013 — 2017",
    degree: "B.S. Computer Science",
    school: "Universidad Vasco de Quiroga, A.C.",
    detail: "Full CS curriculum",
  },
];

export default function ExperienceSection() {
  return (
    <section id="experience" className="relative py-16 md:py-24">
      <div className="notion-section-inner">
        <div className="mb-8 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="notion-caption mb-2">Experience</p>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Work history
            </h2>
          </div>
          <div className="hidden w-full max-w-[200px] shrink-0 lg:block">
            <HairlineFigure
              as={Branches}
              intensity={0.3}
              showCaption={false}
              label="Commit graph; commits rise under the pointer"
            />
          </div>
        </div>

        <div className="border-y border-border">
          <div
            className="hidden border-b border-border py-2 text-xs text-muted-foreground sm:grid sm:grid-cols-[6.5rem_minmax(0,1fr)_auto] sm:gap-4 sm:px-2"
            aria-hidden
          >
            <span>When</span>
            <span>Role</span>
            <span className="text-right">Company</span>
          </div>
          <ul className="divide-y divide-border">
            {experiences.map((exp) => (
              <li
                key={`${exp.role}-${exp.period}`}
                className="px-2 py-4 sm:grid sm:grid-cols-[6.5rem_minmax(0,1fr)_auto] sm:items-start sm:gap-4 sm:py-5"
              >
                <span className="notion-caption block tabular-nums sm:pt-0.5">
                  {exp.period}
                </span>
                <div>
                  <p className="font-medium text-foreground">{exp.role}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {exp.description}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground sm:hidden">
                    {exp.company} · {exp.location}
                  </p>
                </div>
                <div className="mt-2 text-left sm:mt-0 sm:text-right">
                  <p className="text-sm font-medium text-foreground">{exp.company}</p>
                  <p className="text-xs text-muted-foreground">{exp.location}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-16">
          <p className="notion-caption mb-2">Education</p>
          <h3 className="text-xl font-semibold text-foreground">Academic</h3>
          <ul className="mt-6 divide-y divide-border border-y border-border">
            {education.map((edu) => (
              <li
                key={edu.degree}
                className="flex flex-col gap-1 px-2 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
              >
                <div>
                  <p className="font-medium text-foreground">{edu.degree}</p>
                  <p className="text-sm text-muted-foreground">{edu.school}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xs tabular-nums text-muted-foreground">{edu.period}</p>
                  <p className="text-xs text-muted-foreground">{edu.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
