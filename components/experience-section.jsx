"use client";

import { motion } from "framer-motion";

const experiences = [
  {
    period: "2019 - 2023",
    role: "Office Manager & Lead Developer",
    company: "Once Interactive Inc.",
    location: "Remote",
    description:
      "Promoted to lead the First-Line Web Team while managing all office operations in Mexico. Oversaw development workflows, client communications, and project delivery.",
    tags: ["Leadership", "WordPress", "Shopify", "Project Management"],
  },
  {
    period: "2017 - 2023",
    role: "Senior Web Developer",
    company: "Once Interactive Inc.",
    location: "Remote",
    description:
      "Full-time front-end development working with 100+ international companies. Built e-commerce solutions, corporate websites, and custom web applications using WordPress, WooCommerce, and Shopify.",
    tags: ["WordPress", "WooCommerce", "Shopify", "JavaScript", "CSS"],
  },
  {
    period: "2017",
    role: "Web Developer",
    company: "COPARMEX",
    location: "Morelia, Mexico",
    description:
      "Managed and maintained the web platform. First professional role working with WordPress, contributing to social and business events.",
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

export default function ExperienceSection() {
  return (
    <section id="experience" className="relative py-32">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <span className="mb-4 inline-block font-mono text-xs uppercase tracking-widest text-primary">
            02 / Experience
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
              className={`relative mb-16 pl-8 md:w-1/2 md:pl-0 ${i % 2 === 0
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

              <div className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 sm:p-8">
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
          className="mt-32"
        >
          <span className="mb-4 inline-block font-mono text-xs uppercase tracking-widest text-primary">
            Education
          </span>
          <h3 className="mb-12 text-3xl font-bold text-foreground sm:text-4xl">
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
                className="group rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/30"
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
          className="mt-32"
        >
          <span className="mb-4 inline-block font-mono text-xs uppercase tracking-widest text-primary">
            Skills
          </span>
          <h3 className="mb-12 text-3xl font-bold text-foreground sm:text-4xl">
            What I Bring
          </h3>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Frontend Development",
                items: ["React / Next.js", "TypeScript", "Tailwind CSS", "Three.js / R3F"],
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
                  />
                ),
              },
              {
                title: "CMS & E-Commerce",
                items: ["WordPress", "Shopify", "WooCommerce", "Headless CMS"],
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016A3.001 3.001 0 0021 9.349m-18 0V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25v4.1"
                  />
                ),
              },
              {
                title: "Design & UX",
                items: ["Figma", "Adobe XD", "Responsive Design", "Pixel Perfect"],
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42"
                  />
                ),
              },
            ].map((skill, i) => (
              <motion.div
                key={skill.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all group-hover:bg-primary/20">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    {skill.icon}
                  </svg>
                </div>
                <h4 className="mb-4 text-lg font-bold text-foreground">
                  {skill.title}
                </h4>
                <ul className="space-y-2">
                  {skill.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <span className="h-1 w-1 rounded-full bg-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
