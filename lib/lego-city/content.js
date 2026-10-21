import { projects } from "@/lib/projects";

/** Default card for the filler buildings that carry no project or story of their own. */
const PLACE_BLURBS = {
  airport: { title: "Pilleland Airport", subtitle: "Around town · Gate to the world", body: "Every trip starts at the gate. Boarding passes for other cities are coming soon." },
  shop: { subtitle: "Around town · Shopping", body: "A little brick shop with a bell on the door. Nothing to ship here, just good vibes." },
  bar: { subtitle: "Around town · Eats & drinks", body: "Warm lights and the clink of tiny glasses. Locals say the coffee is better than the code." },
  hotel: { subtitle: "Around town · Stay a while", body: "Clean sheets, a lobby fountain and a very patient doorman." },
  tower: { subtitle: "Around town · Skyline", body: "Eight floors of brick and glass. The view from the top is imaginary but excellent." },
  office: { subtitle: "Around town · Workplaces", body: "Somewhere in here, a meeting could have been an email." },
  plaza: { subtitle: "Around town · Public square", body: "Benches, a fountain and plenty of pigeons made of one-by-one bricks." },
  garage: { subtitle: "Around town · Workshop", body: "Oil, bricks and wrenches. The cars of Pilleland get their tune-ups here." },
  civic: { subtitle: "Around town · Civic", body: "Where the city's very serious paperwork lives." },
  park: { subtitle: "Around town · Green space", body: "Trees, paths and somewhere to sit. Perfect for a break between buildings." },
  residential: { subtitle: "Around town · Neighbourhood", body: "Rows of cosy brick homes. Wave at the neighbours." },
};

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
  const c = landmark.content ?? PLACE_BLURBS[landmark.kind] ?? {};
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
