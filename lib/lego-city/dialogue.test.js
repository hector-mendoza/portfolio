import { describe, expect, it } from "vitest";
import { Dialogue, PERSONAS, describeDirection } from "./dialogue.js";
import { compileCity } from "./compile.js";

const city = compileCity();
const from = { x: 0, z: 0 };

describe("describeDirection", () => {
  it("uses compass words with z pointing south", () => {
    expect(describeDirection(from, { x: 0, z: -60 }).compass).toBe("north");
    expect(describeDirection(from, { x: 0, z: 60 }).compass).toBe("south");
    expect(describeDirection(from, { x: 60, z: 0 }).compass).toBe("east");
    expect(describeDirection(from, { x: -42, z: -42 }).compass).toBe("north-west");
  });
  it("says 'right here' when close", () => {
    expect(describeDirection(from, { x: 3, z: 4 }).text).toBe("right here");
  });
});

describe("Dialogue", () => {
  const d = new Dialogue(city);
  const persona = PERSONAS[0];

  it("opens with a greeting and the main menu", () => {
    const n = d.start(persona, { from });
    expect(n.text).toContain(persona.name);
    expect(n.options.map((o) => o.id)).toEqual(expect.arrayContaining(["see", "where", "about", "who", "bye"]));
  });

  it("every option leads somewhere with text", () => {
    const n = d.start(persona, { from });
    for (const o of n.options) {
      const next = d.choose(n, o.id);
      expect(next.text.length).toBeGreaterThan(5);
    }
  });

  it("suggests the nearest unvisited place and can take you there", () => {
    const n = d.choose(d.start(persona, { from }), "see");
    expect(n.suggestion).toBeTruthy();
    const go = n.options.find((o) => o.id.startsWith("go:"));
    const end = d.choose(n, go.id);
    expect(end.end).toBe(true);
    expect(end.waypoint).toMatchObject({ id: n.suggestion.id });
    expect(Number.isFinite(end.waypoint.x)).toBe(true);
  });

  it("'something else' offers a different place each time", () => {
    let n = d.choose(d.start(persona, { from }), "see");
    const seen = new Set([n.suggestion.id]);
    for (let i = 0; i < 4; i++) {
      n = d.choose(n, "see");
      expect(seen.has(n.suggestion.id)).toBe(false);
      seen.add(n.suggestion.id);
    }
  });

  it("skips places the visitor has already opened", () => {
    const first = d.choose(d.start(persona, { from }), "see").suggestion;
    const d2 = new Dialogue(city, { visited: new Set([first.id]) });
    expect(d2.choose(d2.start(persona, { from }), "see").suggestion.id).not.toBe(first.id);
  });

  it("'where' lists the four closest buildings", () => {
    const n = d.choose(d.start(persona, { from }), "where");
    expect(n.options.filter((o) => o.id.startsWith("pick:"))).toHaveLength(4);
  });

  it("goodbye ends the conversation", () => {
    expect(d.choose(d.start(persona, { from }), "bye").end).toBe(true);
  });
});
