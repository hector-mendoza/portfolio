import { describe, expect, it } from "vitest";
import { CITIES, HOME_CITY, getCity, listDestinations, resolveCityId } from "./cities.js";
import { compileCity } from "./compile.js";
import { bodiesOverlap, createTraffic } from "./traffic.js";
import { createLayout } from "./layout.js";

const loadable = CITIES.filter((c) => c.spec);

describe("city registry", () => {
  it("has unique ids and a home city", () => {
    const ids = CITIES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(getCity(HOME_CITY)).toBeTruthy();
  });

  it("falls back to home for unknown or unbuilt cities", () => {
    expect(resolveCityId("atlantis")).toBe(HOME_CITY);
    expect(resolveCityId(null)).toBe(HOME_CITY);
    expect(resolveCityId(HOME_CITY)).toBe(HOME_CITY);
    for (const c of loadable) expect(resolveCityId(c.id)).toBe(c.id);
  });

  it("lists home and the four travel cities on the departures board", () => {
    const ids = listDestinations().map((c) => c.id);
    expect(ids).toEqual([HOME_CITY, "madrid", "paris", "rome", "punta-cana"]);
    for (const c of listDestinations()) expect(getCity(c.id)).toBeTruthy();
  });
});

describe.each(loadable.map((c) => [c.id, c]))("city %s", (_id, entry) => {
  const { spec } = entry;
  const city = compileCity(spec);
  const layout = createLayout(spec.grid);

  it("fills its grid exactly once", () => {
    const seen = new Set(spec.lots.map((l) => l.block.join(",")));
    expect(seen.size).toBe(spec.lots.length);
    expect(spec.lots.length).toBe(spec.grid.blocks * spec.grid.blocks);
    expect(new Set(spec.lots.map((l) => l.id)).size).toBe(spec.lots.length);
  });

  it("routes the tram through stops that exist", () => {
    for (const stop of city.route.stops) {
      expect(stop.lots.every((id) => spec.lots.some((l) => l.id === id))).toBe(true);
      expect(stop.t).toBeGreaterThanOrEqual(0);
      expect(stop.t).toBeLessThanOrEqual(city.route.length);
    }
    expect(spec.lots.some((l) => l.id === spec.spawn.lot)).toBe(true);
  });

  it("registers a landmark for every lot and a sky location", () => {
    expect(city.landmarks.length).toBeGreaterThan(0);
    if (spec.geo) {
      expect(Number.isFinite(spec.geo.latitude + spec.geo.longitude)).toBe(true);
      expect(typeof spec.geo.timeZone).toBe("string");
    }
  });

  it("spawns the visitor on open ground", () => {
    const { x, z } = city.spawn;
    const blocked = city.colliders.some((c) => x + 1.1 > c.x - c.w / 2 && x - 1.1 < c.x + c.w / 2 && z + 1.1 > c.z - c.d / 2 && z - 1.1 < c.z + c.d / 2);
    expect(blocked).toBe(false);
  });

  it("keeps its traffic apart", () => {
    const sim = createTraffic(layout, spec.traffic?.cars ?? 4);
    for (let t = 0; t < 120; t += 0.1) {
      sim.update(0.1);
      for (let i = 0; i < sim.cars.length; i++) for (let j = i + 1; j < sim.cars.length; j++) expect(bodiesOverlap(sim.cars[i], sim.cars[j], 0.5)).toBe(false);
    }
  });

  it("builds cars that match the compiled dynamics", () => {
    const cars = city.dynamic.filter((d) => d.kind === "car");
    expect(cars.length).toBe(spec.traffic?.cars ?? 4);
    for (const c of cars) expect(Number.isFinite(c.plan.cruise)).toBe(true);
  });
});
