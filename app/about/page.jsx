import Link from "next/link";
import JsonLd from "@/components/seo/json-ld";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { EDUCATION, EXPERIENCE, FAQ, PERSON, PILLELAND, PROJECTS, SITE_URL, breadcrumbJsonLd, faqJsonLd, profilePageJsonLd } from "@/lib/site";
import styles from "../blog/blog.module.css";

export const metadata = {
  title: "About Hector Mendoza | Senior Software Engineer in Morelia, Mexico",
  description: `${PERSON.summary} Experience, skills, projects and answers to common questions.`,
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Hector Mendoza",
    description: PERSON.summary,
    url: "/about",
    type: "profile",
    images: [{ url: "/og/pilleland.jpg", width: 1200, height: 630, alt: "Pilleland, Hector Mendoza's LEGO city portfolio" }],
  },
  twitter: { card: "summary_large_image", images: ["/og/pilleland.jpg"] },
};

export default function AboutPage() {
  return (
    <div className={styles.shell} data-portfolio-ui>
      <SiteHeader />
      <main className={styles.page} id="top">
        <div className={styles.container}>
          <header className={styles.intro}>
            <p className={styles.eyebrow}>About</p>
            <h1 className={styles.title}>
              {PERSON.name},<br />
              <em>{PERSON.tagline.toLowerCase()}.</em>
            </h1>
            <p className={styles.description}>{PERSON.summary}</p>
          </header>

          <section aria-labelledby="faq">
            <h2 id="faq">Frequently asked questions</h2>
            {FAQ.map((f) => (
              <div key={f.q}>
                <h3>{f.q}</h3>
                <p>{f.a}</p>
              </div>
            ))}
          </section>

          <section aria-labelledby="experience">
            <h2 id="experience">Experience</h2>
            <ul>
              {EXPERIENCE.map((e) => (
                <li key={e.role + e.org}>
                  <strong>{e.role}</strong>, {e.org} ({e.years}), {e.place}
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="projects">
            <h2 id="projects">Selected projects</h2>
            <ul>
              {PROJECTS.map((p) => (
                <li key={p.name}>
                  <a href={p.url}>{p.name}</a> ({p.year}): {p.text}
                </li>
              ))}
              <li>
                <Link href="/">{PILLELAND.name}</Link>: {PILLELAND.summary}
              </li>
            </ul>
          </section>

          <section aria-labelledby="education">
            <h2 id="education">Education</h2>
            <ul>
              {EDUCATION.map((e) => (
                <li key={e.degree}>
                  {e.degree}, {e.school} ({e.years})
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="contact">
            <h2 id="contact">Contact</h2>
            <p>
              <a href={`mailto:${PERSON.email}`}>{PERSON.email}</a> · {PERSON.city}, {PERSON.country}
            </p>
            <ul>
              {PERSON.sameAs.map((u) => (
                <li key={u}>
                  <a href={u} rel="me">
                    {u.replace(/^https:\/\/(www\.)?/, "")}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
      <SiteFooter />
      <JsonLd data={profilePageJsonLd()} />
      <JsonLd data={faqJsonLd()} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: SITE_URL },
          { name: "About", url: `${SITE_URL}/about` },
        ])}
      />
    </div>
  );
}
