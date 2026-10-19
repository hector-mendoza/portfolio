import { projects } from "@/lib/projects";

/** Resolves what a landmark card should show (project data or inline spec content). */
export function resolveLandmark(landmark) {
  if (!landmark) return null;
  if (landmark.project) {
    const project = projects.find((p) => p.title === landmark.project);
    if (project) {
      return {
        id: landmark.id,
        kind: "project",
        eyebrow: `${project.category} · ${project.year}`,
        title: project.title,
        subtitle: project.subtitle,
        body: project.description,
        tags: project.tags,
        cta: "Visit project",
        href: project.url,
        external: true,
        accent: project.accent,
      };
    }
  }
  const c = landmark.content ?? {};
  const kindLabel = {
    hero: "Welcome",
    about: "About",
    contact: "Contact",
    blog: "Writing",
    experience: "Experience",
    education: "Education",
    station: "Transit",
    place: "Around town",
  };
  return {
    id: landmark.id,
    kind: c.kind ?? "place",
    eyebrow: kindLabel[c.kind] ?? "Place",
    title: c.title ?? landmark.title,
    subtitle: c.subtitle ?? "",
    body: c.body ?? "",
    tags: c.tags ?? [],
    stats: c.stats ?? null,
    links: c.links ?? null,
    cta: c.cta ?? null,
    href: c.href ?? null,
    external: !!c.href && /^https?:|^mailto:/.test(c.href),
  };
}
