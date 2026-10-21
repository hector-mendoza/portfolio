/**
 * Citizen conversations: pure data in, pure data out. A conversation is a node
 * { text, options: [{ id, label }], waypoint? }; `choose` moves to the next one.
 * The app only renders nodes and keeps the chosen waypoint.
 */

export const PERSONAS = [
  { name: "Benny", role: "Brick courier", quirk: "I deliver bricks. Mostly the right ones." },
  { name: "Lola", role: "Tram fan", quirk: "I know every squeak of that red tram." },
  { name: "Otto", role: "Street cleaner", quirk: "Not one stray stud on my watch!" },
  { name: "Mina", role: "Café owner", quirk: "Best brick-brewed coffee in town." },
  { name: "Gus", role: "Builder", quirk: "Everything is awesome when it clicks." },
  { name: "Pia", role: "Park ranger", quirk: "Ask me about the trees. They are tall." },
  { name: "Remy", role: "Tourist", quirk: "I only came for one day. That was a year ago." },
  { name: "Nora", role: "Night owl", quirk: "The lights here are the best after dark." },
];

const COMPASS = ["east", "south-east", "south", "south-west", "west", "north-west", "north", "north-east"];

/** "about 60 studs north-east" from one point to another (z grows southward). */
export function describeDirection(from, to) {
  const dx = to.x - from.x;
  const dz = to.z - from.z;
  const dist = Math.hypot(dx, dz);
  const idx = Math.round((Math.atan2(dz, dx) / (Math.PI * 2)) * 8 + 8) % 8;
  const rounded = Math.max(10, Math.round(dist / 10) * 10);
  return { dist, compass: COMPASS[idx], text: dist < 14 ? "right here" : `about ${rounded} studs ${COMPASS[idx]}` };
}

const MAIN = (persona) => [
  { id: "see", label: "What should I see?" },
  { id: "where", label: "Where is…?" },
  { id: "about", label: "What is this place?" },
  { id: "who", label: "Who built it?" },
  { id: "bye", label: "Bye!" },
];

const wp = (lm) => ({ id: lm.id, title: lm.title, x: lm.x, z: lm.z });

export class Dialogue {
  /** city: compiled city; visited: Set of landmark ids the visitor has opened. */
  constructor(city, { visited = new Set() } = {}) {
    this.city = city;
    this.visited = visited;
    this.landmarks = city.landmarks.filter((l) => l.kind !== "station");
  }

  start(persona, { from, weather = null } = {}) {
    const hello = weather?.rain ? "Nice weather for umbrellas!" : weather?.night ? "Lovely evening for a stroll!" : "Hello, traveller!";
    return {
      persona,
      from,
      text: `${hello} I'm ${persona.name}, ${persona.role.toLowerCase()}. ${persona.quirk}`,
      options: MAIN(persona),
    };
  }

  nearestUnvisited(from, skip = new Set()) {
    let best = null;
    for (const lm of this.landmarks) {
      if (this.visited.has(lm.id) || skip.has(lm.id)) continue;
      const d = Math.hypot(lm.x - from.x, lm.z - from.z);
      if (!best || d < best.d) best = { lm, d };
    }
    return best?.lm ?? null;
  }

  /** Next node for `option` ("see", "where", "about", "who", "bye", "go:<id>", "pick:<id>", "back"). */
  choose(node, option) {
    const { persona, from } = node;
    const keep = { persona, from };
    if (option === "bye") return { ...keep, text: `See you around, ${persona.name} says. Mind the cars!`, options: [], end: true };
    if (option === "back") return { ...keep, text: "Anything else?", options: MAIN(persona) };
    if (option === "about") {
      return {
        ...keep,
        text: `${this.city.name} is a tiny city built from bricks, one project at a time. Every building you see is something Hector made.`,
        options: MAIN(persona),
      };
    }
    if (option === "who") {
      return {
        ...keep,
        text: "Hector Mendoza, a software engineer who builds for the web. Walk into a building and he'll tell you the story.",
        options: MAIN(persona),
      };
    }
    if (option === "see") {
      const skip = node.skipped ?? new Set();
      const lm = this.nearestUnvisited(from, skip) ?? this.nearestUnvisited(from);
      if (!lm) return { ...keep, text: "You've been everywhere! Try the Ferris wheel for a view.", options: MAIN(persona) };
      const dir = describeDirection(from, lm);
      return {
        ...keep,
        suggestion: lm,
        skipped: new Set([...skip, lm.id]),
        text: `Try ${lm.title}: ${lm.project ?? "a fine building"}. It's ${dir.text}.`,
        options: [
          { id: `go:${lm.id}`, label: "Take me there" },
          { id: "see", label: "Something else" },
          { id: "back", label: "Never mind" },
        ],
      };
    }
    if (option === "where") {
      const near = [...this.landmarks]
        .sort((a, b) => Math.hypot(a.x - from.x, a.z - from.z) - Math.hypot(b.x - from.x, b.z - from.z))
        .slice(0, 4);
      return {
        ...keep,
        text: "These are close by:",
        options: [...near.map((lm) => ({ id: `pick:${lm.id}`, label: lm.title })), { id: "back", label: "Never mind" }],
      };
    }
    if (option.startsWith("pick:") || option.startsWith("go:")) {
      const id = option.slice(option.indexOf(":") + 1);
      const lm = this.landmarks.find((l) => l.id === id);
      if (!lm) return { ...keep, text: "Hmm, I don't know that one.", options: MAIN(persona) };
      if (option.startsWith("pick:")) {
        const dir = describeDirection(from, lm);
        return {
          ...keep,
          text: `${lm.title} is ${dir.text}.`,
          options: [{ id: `go:${lm.id}`, label: "Take me there" }, { id: "back", label: "Thanks" }],
        };
      }
      return { ...keep, text: `Follow the golden beam to ${lm.title}!`, options: [], end: true, waypoint: wp(lm) };
    }
    return { ...keep, text: "Anything else?", options: MAIN(persona) };
  }
}
