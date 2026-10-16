import { ArrowUpRight } from "lucide-react";
import HomeWorkList from "@/components/home-work-list";
import SectionSceneRegister from "@/components/scene/SectionSceneRegister";
import { DeferredBelowFoldHairline } from "@/components/deferred-below-fold-hairline";
import HairlineLogo from "@/components/hairline-logo";
import HeroHairlineTerminal from "@/components/hero-hairline-terminal";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import ScrollTextReveal from "@/components/scroll-text-reveal";
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
    <main className={styles.page} data-portfolio-ui>
      <SiteHeader />

      <section id="top" data-section="hero" className={styles.hero}>
        <SectionSceneRegister id="hero" targetId="top" />
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
          <HeroHairlineTerminal />
          <p>Move your pointer across the system.</p>
        </div>
      </section>

      <section className={styles.work} id="work" aria-labelledby="work-title">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>02 / Selected archive</p>
          <h2 id="work-title">Work that holds up.</h2>
          <div className={styles.headingAside}>
            <p>
              Product engineering, creative development, and client work across
              hospitality, commerce, and the open web.
            </p>
            <DeferredBelowFoldHairline which="plot-riffle" />
          </div>
        </div>
        <HomeWorkList />
      </section>

      <ScrollTextReveal />

      <section className={styles.commandLab} aria-labelledby="command-title">
        <div className={styles.commandCopy}>
          <p className={styles.eyebrow}>03 / An open invitation</p>
          <h2 id="command-title">Give your agent a sharper line.</h2>
          <p>
            Hairline is a small set of precise, pointer-aware drawings. Its
            companion skill teaches coding agents the same visual discipline.
          </p>
          <code>
            <span aria-hidden="true">$</span>
            npx skills add lucasmarkes/hairline
          </code>
          <div className={styles.commandKeys}>
            <DeferredBelowFoldHairline which="keyboard-dark" />
          </div>
          <a
            href="https://hairline.lucasmarkes.com/"
            target="_blank"
            rel="noreferrer"
          >
            Explore Hairline
            <ArrowUpRight aria-hidden="true" size={17} />
          </a>
        </div>
        <div className={styles.commandFigure}>
          <DeferredBelowFoldHairline which="branches" />
          <p>Trace the branch with your pointer.</p>
        </div>
      </section>

      <section className={styles.about} id="about" aria-labelledby="about-title">
        <div className={styles.logoPortrait}>
          <HairlineLogo />
          <span>HM / Drawn with Hairline</span>
        </div>
        <div className={styles.aboutCopy}>
          <p className={styles.eyebrow}>04 / About</p>
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
          <p className={styles.eyebrow}>05 / Experience</p>
          <h2 id="experience-title">A record of making.</h2>
          <div className={styles.headingFigure}>
            <DeferredBelowFoldHairline which="cabinet" />
          </div>
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
        <div className={styles.contactCopy}>
          <p className={styles.eyebrow}>06 / Start a conversation</p>
          <h2>
            Have something
            <br />
            worth building?
          </h2>
          <a href="mailto:hey@hectormendoza.me">
            hey@hectormendoza.me
            <ArrowUpRight aria-hidden="true" />
          </a>
        </div>
        <div className={styles.contactFigure}>
          <DeferredBelowFoldHairline which="phone" />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
