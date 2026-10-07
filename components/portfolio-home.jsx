import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { projects } from "@/lib/projects";
import HairlineTerminal from "@/components/hairline-terminal";
import portrait from "@/public/pp.png";
import styles from "./portfolio-home.module.css";

export default function PortfolioHome() {
  const experience = [
    ["2024—Now", "Head of Web Integrations", "UrVenue"],
    ["2023—2024", "Web Services Developer", "UrVenue"],
    ["2019—2023", "Office Manager & Lead Developer", "Once Interactive"],
    ["2017—2023", "Senior Web Developer", "Once Interactive"],
    ["2017", "Web Developer", "COPARMEX Michoacán"],
  ];

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a className={styles.wordmark} href="#top" aria-label="Hector Mendoza, home">
          HM<span>.</span>
        </a>
        <nav className={styles.nav} aria-label="Primary navigation">
          <a href="#work">Work</a>
          <a href="#about">About</a>
          <a href="/blog">Writing</a>
        </nav>
        <a className={styles.availability} href="mailto:hey@hectormendoza.me">
          <span aria-hidden="true" />
          Let&apos;s talk
        </a>
      </header>

      <section className={styles.hero} id="top">
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Software engineer · Morelia, MX</p>
          <h1>
            Building digital
            <br />
            products with <em>clarity.</em>
          </h1>
          <div className={styles.heroIntro}>
            <p>
              I&apos;m Hector, a design-minded engineer leading web integrations at
              UrVenue. I turn complex systems into focused, fast, and human
              experiences.
            </p>
            <a href="#work">
              Explore selected work
              <ArrowUpRight aria-hidden="true" size={17} />
            </a>
          </div>
        </div>
        <div className={styles.heroFigure}>
          <span className={styles.figureIndex}>01 / INTERACTIVE SYSTEM</span>
          <HairlineTerminal />
          <p>Move your pointer across the system.</p>
        </div>
      </section>

      <section className={styles.work} id="work" aria-labelledby="work-title">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>02 / Selected archive</p>
          <h2 id="work-title">Work that holds up.</h2>
          <p>
            Product engineering, creative development, and client work across
            hospitality, commerce, and the open web.
          </p>
        </div>
        <div className={styles.projectList}>
          {projects.map((project, index) => (
            <a
              className={styles.project}
              href={project.url}
              key={project.title}
              target="_blank"
              rel="noreferrer"
            >
              <span className={styles.projectNumber}>
                {String(index + 1).padStart(2, "0")}
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
          ))}
        </div>
      </section>

      <section className={styles.about} id="about" aria-labelledby="about-title">
        <div className={styles.portrait}>
          <Image
            src={portrait}
            alt="Hector Mendoza"
            sizes="(max-width: 800px) 100vw, 42vw"
            placeholder="blur"
          />
          <span>Based in Morelia, Mexico · Available worldwide</span>
        </div>
        <div className={styles.aboutCopy}>
          <p className={styles.eyebrow}>03 / About</p>
          <h2 id="about-title">
            Engineer by training.
            <br />
            <em>Designer in practice.</em>
          </h2>
          <p className={styles.lead}>
            For more than eight years, I&apos;ve built web experiences where
            technical rigor and visual restraint meet.
          </p>
          <p>
            Today I lead web integrations at UrVenue. Before that, I led a web
            team delivering work for more than 50 international companies. I
            hold a Master&apos;s degree in Computer Science, specializing in
            mobile application development.
          </p>
          <dl className={styles.stats}>
            <div>
              <dt>8+</dt>
              <dd>Years building</dd>
            </div>
            <div>
              <dt>20+</dt>
              <dd>Projects delivered</dd>
            </div>
            <div>
              <dt>10+</dt>
              <dd>Happy clients</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className={styles.experience} aria-labelledby="experience-title">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>04 / Experience</p>
          <h2 id="experience-title">A record of making.</h2>
        </div>
        <div className={styles.timeline}>
          {experience.map(([period, role, company]) => (
            <div className={styles.role} key={`${role}-${company}`}>
              <span>{period}</span>
              <strong>{role}</strong>
              <p>{company}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.contact} id="contact">
        <p className={styles.eyebrow}>05 / Start a conversation</p>
        <h2>
          Have something
          <br />
          worth building?
        </h2>
        <a href="mailto:hey@hectormendoza.me">
          hey@hectormendoza.me
          <ArrowUpRight aria-hidden="true" />
        </a>
      </section>

      <footer className={styles.footer}>
        <span>© {new Date().getFullYear()} Hector Mendoza</span>
        <div>
          <a href="https://github.com/hector-mendoza">GitHub</a>
          <a href="https://www.linkedin.com/in/hector-mendoza-m/">LinkedIn</a>
          <a href="/blog">Writing</a>
        </div>
        <a href="#top">Back to top ↑</a>
      </footer>
    </main>
  );
}
