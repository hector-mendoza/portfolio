import { describe, expect, it } from "vitest";
import { compileCity, serializeCity } from "./compile.js";
import spec from "./spec.js";
import { createLayout, createRng } from "./layout.js";
import { PALETTE } from "./palette.js";
import { textCells, textWidth, SUPPORTED_CHARS } from "./font.js";
import { Parts } from "./parts.js";
import { projects } from "@/lib/projects";

const city = compileCity();

describe("city spec", () => {
  it("places every lot on a unique block inside the grid", () => {
    const seen = new Set();
    for (const lot of spec.lots) {
      const [c, r] = lot.block;
      expect(c).toBeGreaterThanOrEqual(0);
      expect(r).toBeGreaterThanOrEqual(0);
      expect(c).toBeLessThan(spec.grid.blocks);
      expect(r).toBeLessThan(spec.grid.blocks);
      expect(seen.has(`${c},${r}`)).toBe(false);
      seen.add(`${c},${r}`);
    }
    expect(seen.size).toBe(spec.grid.blocks * spec.grid.blocks);
  });

  it("only uses colours from the LEGO palette", () => {
    for (const lot of spec.lots) {
      if (lot.color) expect(PALETTE[lot.color]).toBeDefined();
      if (lot.roof) expect(PALETTE[lot.roof]).toBeDefined();
    }
    for (const item of city.items) expect(PALETTE[item.c]).toBeDefined();
  });

  it("links every project lot to a real project", () => {
    const titles = new Set(projects.map((p) => p.title));
    const projectLots = spec.lots.filter((l) => l.project);
    expect(projectLots.length).toBe(projects.length);
    for (const lot of projectLots) expect(titles.has(lot.project)).toBe(true);
  });

  it("has a landmark for every lot a tram stop points at", () => {
    for (const stop of spec.route.stops) {
      for (const id of stop.lots) {
        expect(spec.lots.some((l) => l.id === id)).toBe(true);
        expect(city.landmarks.some((lm) => lm.lotId === id)).toBe(true);
      }
    }
  });

  it("visits every content-bearing lot from the tram", () => {
    const visited = new Set(spec.route.stops.flatMap((s) => s.lots));
    for (const lot of spec.lots) if (lot.project || lot.content) expect(visited.has(lot.id)).toBe(true);
  });
});

describe("compiled city", () => {
  it("produces finite geometry only", () => {
    for (const item of city.items) {
      for (const key of ["x", "y", "z", "w", "h", "d", "r"]) {
        if (item[key] !== undefined) expect(Number.isFinite(item[key])).toBe(true);
      }
      if (item.t === "box" || item.t === "wedge") expect(item.w > 0 && item.h > 0 && item.d > 0).toBe(true);
      if (item.t === "cyl" || item.t === "cone") expect(item.r > 0 && item.h > 0).toBe(true);
    }
  });

  it("keeps every brick inside the city bounds", () => {
    for (const item of city.items) {
      expect(Math.abs(item.x)).toBeLessThanOrEqual(city.bounds + 1);
      expect(Math.abs(item.z)).toBeLessThanOrEqual(city.bounds + 1);
    }
  });

  it("places every stop on the route and starts the tour at the station", () => {
    for (const stop of city.route.stops) {
      expect(stop.t).toBeGreaterThanOrEqual(0);
      expect(stop.t).toBeLessThanOrEqual(city.route.length);
      const onRoute = city.route.points.some((p, i) => {
        if (i === 0) return false;
        const a = city.route.points[i - 1];
        const minX = Math.min(a.x, p.x) - 0.01;
        const maxX = Math.max(a.x, p.x) + 0.01;
        const minZ = Math.min(a.z, p.z) - 0.01;
        const maxZ = Math.max(a.z, p.z) + 0.01;
        return stop.x >= minX && stop.x <= maxX && stop.z >= minZ && stop.z <= maxZ;
      });
      expect(onRoute).toBe(true);
    }
    expect(city.route.stops[0].lots).toEqual(["station"]);
  });

  it("spawns the visitor somewhere walkable", () => {
    const { x, z } = city.spawn;
    const r = 1.1;
    const blocked = city.colliders.some(
      (c) => x + r > c.x - c.w / 2 && x - r < c.x + c.w / 2 && z + r > c.z - c.d / 2 && z - r < c.z + c.d / 2,
    );
    expect(blocked).toBe(false);
  });

  it("does not register colliders for moving vehicles", () => {
    const tram = city.dynamic.find((d) => d.kind === "tram");
    const near = city.colliders.filter((c) => Math.hypot(c.x - tram.x, c.z - tram.z) < 4 && c.w > 4 && c.d > 10);
    expect(near.length).toBe(0);
  });

  it("generates studs for every stud-capable static box", () => {
    const total = Object.values(city.studs).reduce((n, list) => n + list.length / 3, 0);
    expect(total).toBeGreaterThan(20000);
    expect(total).toBeLessThan(40000);
    for (const list of Object.values(city.studs)) expect(list.length % 3).toBe(0);
  });

  it("serialises to plain JSON for Blender", () => {
    const json = JSON.parse(JSON.stringify(serializeCity(city)));
    expect(json.items.length).toBe(city.items.length);
    expect(json.route.stops.length).toBe(spec.route.stops.length);
    expect(json.landmarks[0].content).toBeUndefined();
  });

  it("is deterministic", () => {
    const again = compileCity();
    expect(again.items.length).toBe(city.items.length);
    expect(again.items[1234]).toEqual(city.items[1234]);
  });
});

describe("layout", () => {
  const layout = createLayout(spec.grid);

  it("computes block rects that sit between roads", () => {
    const a = layout.blockRect(0, 0);
    const b = layout.blockRect(1, 0);
    expect(b.x0 - (a.x0 + a.size)).toBe(spec.grid.road);
    expect(a.x0).toBe(-layout.half + spec.grid.road);
  });

  it("puts road centrelines on the grid pitch", () => {
    expect(layout.roadCoord(1) - layout.roadCoord(0)).toBe(spec.grid.block + spec.grid.road);
    expect(layout.roadCoord(0)).toBe(-layout.half + spec.grid.road / 2);
  });

  it("has a stable seeded random generator", () => {
    const a = createRng(42);
    const b = createRng(42);
    expect([a.next(), a.next(), a.int(0, 9)]).toEqual([b.next(), b.next(), b.int(0, 9)]);
  });
});

describe("parts frames", () => {
  it("rotates local coordinates in quarter turns", () => {
    const p = new Parts();
    p.push(10, 20, 1);
    expect(p.world(1, 0)).toEqual([10, 21]);
    expect(p.world(0, -1)).toEqual([11, 20]);
    p.pop();
    p.push(0, 0, 2);
    expect(p.world(3, 4)).toEqual([-3, -4]);
    p.pop();
  });

  it("rotates wedge directions with the frame", () => {
    const p = new Parts();
    p.push(0, 0, 1);
    const w = p.wedge(0, 0, 0, 2, 1, 4, "n", "white");
    expect(w.dir).toBe("e");
    expect([w.w, w.d]).toEqual([4, 2]);
    p.pop();
  });
});

describe("brick font", () => {
  it("renders every supported character within a 3x5 cell", () => {
    for (const ch of SUPPORTED_CHARS) {
      for (const [c, r] of textCells(ch)) {
        expect(c).toBeGreaterThanOrEqual(0);
        expect(c).toBeLessThan(3);
        expect(r).toBeGreaterThanOrEqual(0);
        expect(r).toBeLessThan(5);
      }
    }
    expect(textWidth("MENDOZA")).toBe(27);
  });
});
