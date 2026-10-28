import Link from "next/link";
import { EXPERIENCE, FAQ, PERSON, PILLELAND, PROJECTS } from "@/lib/site";

/**
 * The home page is a WebGL city, so crawlers and screen readers get the same story as plain HTML.
 * Visually hidden, server-rendered, and the only h1 on the page.
 */
export default function HomeSeoContent() {
  return (
    <div className="sr-only">
      <h1>
        {PERSON.name}: {PERSON.tagline}
      </h1>
      <p>{PERSON.summary}</p>
      <p>{PILLELAND.summary}</p>
      <nav aria-label="Site sections">
        <ul>
          <li>
            <Link href="/about">About Hector Mendoza and FAQ</Link>
          </li>
          <li>
            <Link href="/classic">Classic portfolio</Link>
          </li>
          <li>
            <Link href="/blog">Writing</Link>
          </li>
        </ul>
      </nav>
      <h2>Experience</h2>
      <ul>
        {EXPERIENCE.map((e) => (
          <li key={e.role + e.org}>
            {e.role}, {e.org} ({e.years}), {e.place}
          </li>
        ))}
      </ul>
      <h2>Projects</h2>
      <ul>
        {PROJECTS.map((p) => (
          <li key={p.name}>
            <a href={p.url}>{p.name}</a> ({p.year}): {p.text}
          </li>
        ))}
      </ul>
      <h2>Frequently asked questions</h2>
      <dl>
        {FAQ.map((f) => (
          <div key={f.q}>
            <dt>{f.q}</dt>
            <dd>{f.a}</dd>
          </div>
        ))}
      </dl>
      <p>
        Contact: <a href={`mailto:${PERSON.email}`}>{PERSON.email}</a>
      </p>
    </div>
  );
}
