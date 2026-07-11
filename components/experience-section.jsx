"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { CodeXmlIcon, ShoppingBagIcon, FigmaIcon } from "@animateicons/react/lucide";

const experiences = [
  {
    period: "2024 - Present",
    role: "Head of Web Integrations",
    company: "UrVenue",
    location: "Morelia, Mexico",
    description:
      "Leading web integrations strategy and execution across the UrVenue platform. Overseeing technical direction, team workflows, and delivery of high-impact web projects for enterprise venue technology clients.",
    tags: ["Leadership", "Next.js", "Integrations", "Project Management"],
  },
  {
    period: "2023 - 2024",
    role: "Web Services Developer",
    company: "UrVenue",
    location: "Morelia, Mexico",
    description:
      "Developed and maintained web services powering venue technology solutions. Collaborated cross-functionally to ship features, integrations, and client-facing experiences.",
    tags: ["JavaScript", "React", "APIs", "Pipedream"],
  },
  {
    period: "2019 - 2023",
    role: "Office Manager & Lead Developer",
    company: "Once Interactive Inc.",
    location: "Remote",
    description:
      "Promoted to lead the First-Line Web Team while managing all office operations in Mexico. Oversaw development workflows, client communications, and project delivery for 50+ international companies.",
    tags: ["Leadership", "WordPress", "Shopify", "Project Management"],
  },
  {
    period: "2017 - 2023",
    role: "Senior Web Developer",
    company: "Once Interactive Inc.",
    location: "Remote",
    description:
      "Full-time front-end development working with clients across e-commerce, hospitality, and corporate sectors. Built solutions using WordPress, WooCommerce, and Shopify.",
    tags: ["WordPress", "WooCommerce", "Shopify", "JavaScript", "CSS"],
  },
  {
    period: "2017",
    role: "Web Developer",
    company: "COPARMEX Michoacán",
    location: "Morelia, Mexico",
    description:
      "Managed and maintained the web platform. First professional role contributing to social and business events for the employers' confederation.",
    tags: ["WordPress", "PHP", "Web Maintenance"],
  },
];

const education = [
  {
    period: "2018 - 2020",
    degree: "Master's Degree in Computer Science",
    school: "Universidad Vasco de Quiroga, A.C.",
    detail: "Specialty in Mobile App Development",
  },
  {
    period: "2013 - 2017",
    degree: "Engineer's Degree in Computer Science",
    school: "Universidad Vasco de Quiroga, A.C.",
    detail: "Full CS curriculum",
  },
];

function SkillCard({ skill, index }) {
  const ref = useRef(null);
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="group rounded-2xl glass-card p-8"
      onMouseEnter={() => ref.current?.startAnimation()}
      onMouseLeave={() => ref.current?.stopAnimation()}
    >
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-all group-hover:bg-primary/20">
        <skill.Icon ref={ref} size={24} color="hsl(var(--primary))" />
      </div>
      <h4 className="mb-4 text-lg font-bold text-foreground">{skill.title}</h4>
      <ul className="space-y-2">
        {skill.items.map((item) => (
          <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="h-1 w-1 rounded-full bg-primary" />
            {item}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

export default function ExperienceSection() {
  return (
    <section id="experience" className="relative py-16 md:py-32 bg-background/90">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-10 md:mb-20"
        >
          <span className="mb-4 inline-block font-mono text-xs uppercase tracking-widest text-primary">
            Experience
          </span>
          <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            <span className="text-balance block">
              {"Where I've "}
              <span className="text-gradient">worked</span>
            </span>
          </h2>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-0 top-0 bottom-0 w-px bg-border md:left-1/2" />

          {experiences.map((exp, i) => (
            <motion.div
              key={exp.role}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: i * 0.15 }}
              className={`relative mb-8 md:mb-16 pl-8 md:w-1/2 md:pl-0 ${i % 2 === 0
                ? "md:pr-16"
                : "md:ml-auto md:pl-16"
                }`}
            >
              {/* Timeline dot */}
              <div
                className={`absolute top-2 left-0 ${i % 2 === 0
                  ? "md:-right-[5px] md:left-auto "
                  : "md:-left-[5px]"
                  }`}
              >
                <div className="h-2.5 w-2.5 rounded-full bg-primary shadow-lg shadow-primary/50" />
              </div>

              <div className="group rounded-2xl glass-card p-6 sm:p-8">
                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-primary/10 px-3 py-1 font-mono text-xs text-primary">
                    {exp.period}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {exp.location}
                  </span>
                </div>
                <h3 className="mb-1 text-xl font-bold text-foreground">
                  {exp.role}
                </h3>
                <p className="mb-4 text-sm font-medium text-primary">
                  {exp.company}
                </p>
                <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
                  {exp.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {exp.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Education */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-16 md:mt-32"
        >
          <span className="mb-4 inline-block font-mono text-xs uppercase tracking-widest text-primary">
            Education
          </span>
          <h3 className="mb-8 md:mb-12 text-3xl font-bold text-foreground sm:text-4xl">
            Academic Background
          </h3>

          <div className="grid gap-6 md:grid-cols-2">
            {education.map((edu, i) => (
              <motion.div
                key={edu.degree}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="group rounded-2xl glass-card p-8"
              >
                <span className="mb-4 inline-block rounded-full bg-primary/10 px-3 py-1 font-mono text-xs text-primary">
                  {edu.period}
                </span>
                <h4 className="mb-2 text-lg font-bold text-foreground">
                  {edu.degree}
                </h4>
                <p className="mb-1 text-sm text-primary">{edu.school}</p>
                <p className="text-sm text-muted-foreground">{edu.detail}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Skills visualization */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-16 md:mt-32"
        >
          <span className="mb-4 inline-block font-mono text-xs uppercase tracking-widest text-primary">
            Skills
          </span>
          <h3 className="mb-8 md:mb-12 text-3xl font-bold text-foreground sm:text-4xl">
            What I Bring
          </h3>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Frontend Development", Icon: CodeXmlIcon,    items: ["React / Next.js", "TypeScript", "Tailwind CSS", "Three.js / R3F"] },
              { title: "CMS & E-Commerce",     Icon: ShoppingBagIcon, items: ["WordPress", "Shopify", "WooCommerce", "Headless CMS"] },
              { title: "Design & UX",          Icon: FigmaIcon,       items: ["Figma", "Adobe XD", "Responsive Design", "Pixel Perfect"] },
            ].map((skill, i) => (
              <SkillCard key={skill.title} skill={skill} index={i} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
