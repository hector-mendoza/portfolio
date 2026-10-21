import { describe, expect, it } from "vitest";
import { Traffic, bodiesOverlap, buildLoop, createTraffic, findZones, intersectionCenters, planLoops, samplePath } from "./traffic.js";
import { createLayout } from "./layout.js";
import spec from "./spec.js";

const layout = createLayout(spec.grid);

const overlap = (a, b) => bodiesOverlap(a, b, 0.5);

describe("lane loops", () => {
  const path = buildLoop({ x0: -100, z0: -100, x1: 100, z1: 100, lane: 5.5, dir: 1 });

  it("is closed and has the right perimeter order of magnitude", () => {
    expect(path.length).toBeGreaterThan(700);
    const a = samplePath(path, 0);
    const b = samplePath(path, path.length);
    expect(Math.hypot(a.x - b.x, a.z - b.z)).toBeLessThan(1e-6);
  });

  it("drives clockwise on the right: heading east on the north side, south of the centreline", () => {
    const top = samplePath(path, path.length * 0.07);
    expect(top.hx).toBeGreaterThan(0.99);
    expect(top.z).toBeGreaterThan(-100); // south of the centreline = right-hand side facing east
    const ccw = buildLoop({ x0: -100, z0: -100, x1: 100, z1: 100, lane: 5.5, dir: -1 });
    const t2 = samplePath(ccw, ccw.length * 0.25);
    expect(Math.abs(t2.hx) + Math.abs(t2.hz)).toBeCloseTo(1, 1);
  });

  it("has unit headings everywhere", () => {
    for (let s = 0; s < path.length; s += 13) {
      const p = samplePath(path, s);
      expect(Math.hypot(p.hx, p.hz)).toBeCloseTo(1, 5);
    }
  });
});

describe("intersection reservations", () => {
  it("finds the boxes each loop passes through", () => {
    const loops = planLoops(layout, 4, 99);
    const centers = intersectionCenters(layout);
    for (const l of loops) {
      const zones = findZones(l.path, centers, 12.5);
      expect(zones.length).toBeGreaterThanOrEqual(4); // at least its four corners
      for (const z of zones) expect(z.span).toBeGreaterThan(10);
    }
  });

  it("lets only one car into a box at a time", () => {
    const sim = createTraffic(layout, 16, { seed: 62, simSeed: 2 });
    for (let t = 0; t < 300; t += 0.1) {
      sim.update(0.1);
      const inside = new Map();
      for (const c of sim.cars) {
        if (c.owns < 0) continue;
        expect(inside.has(c.owns)).toBe(false);
        inside.set(c.owns, c.id);
      }
    }
  });
});

describe("traffic", { timeout: 60000 }, () => {
  it("never lets two cars overlap over ten simulated minutes", () => {
    const sim = createTraffic(layout, 12);
    let minGap = Infinity;
    for (let t = 0; t < 600; t += 0.1) {
      sim.update(0.1);
      for (let i = 0; i < sim.cars.length; i++) {
        for (let j = i + 1; j < sim.cars.length; j++) {
          expect(overlap(sim.cars[i], sim.cars[j])).toBe(false);
          minGap = Math.min(minGap, Math.hypot(sim.cars[i].x - sim.cars[j].x, sim.cars[i].z - sim.cars[j].z));
        }
      }
    }
    expect(minGap).toBeGreaterThan(4);
  });

  it("holds across several seeds and a crowd of 16 cars", () => {
    for (const seed of [1, 2, 3, 4]) {
      const sim = createTraffic(layout, 16, { seed: seed * 31, simSeed: seed });
      for (let t = 0; t < 200; t += 0.1) {
        sim.update(0.1);
        for (let i = 0; i < sim.cars.length; i++) for (let j = i + 1; j < sim.cars.length; j++) expect(overlap(sim.cars[i], sim.cars[j])).toBe(false);
      }
    }
  });

  it("stops for a visitor who runs out in front of it", () => {
    const path = buildLoop({ x0: -100, z0: -100, x1: 100, z1: 100, lane: 5.5 });
    const sim = new Traffic([{ path, cruise: 11 }]);
    const car = sim.cars[0];
    car.s = 40;
    sim.sync(car);
    const lane = samplePath(path, car.s + 24);
    // sprinting across the lane from the kerb at 9 studs/s, perpendicular to the car
    const player = { x: lane.x - lane.hz * 14, z: lane.z + lane.hx * 14, vx: lane.hz * 9, vz: -lane.hx * 9 };
    let closest = Infinity;
    for (let t = 0; t < 4; t += 0.05) {
      sim.update(0.05, { player: { ...player } });
      player.x += player.vx * 0.05;
      player.z += player.vz * 0.05;
      closest = Math.min(closest, Math.hypot(car.x - player.x, car.z - player.z));
    }
    expect(closest).toBeGreaterThan(4.5);
  });

  it("never deadlocks: nobody waits on other cars for more than 30 seconds", () => {
    for (const [loops, count, seed] of [[99, 12, 7], [31, 16, 1], [62, 16, 2], [93, 14, 3]]) {
      const sim = createTraffic(layout, count, { seed: loops, simSeed: seed });
      let worst = 0;
      for (let t = 0; t < 400; t += 0.1) {
        sim.update(0.1);
        for (const c of sim.cars) worst = Math.max(worst, c.stuck);
      }
      expect(worst).toBeLessThan(30);
    }
  });

  it("keeps moving: no car is parked for the whole run", () => {
    const sim = createTraffic(layout, 12);
    const travelled = sim.cars.map(() => 0);
    for (let t = 0; t < 300; t += 0.1) {
      const before = sim.cars.map((c) => c.s);
      sim.update(0.1);
      sim.cars.forEach((c, i) => (travelled[i] += c.s - before[i]));
    }
    for (const d of travelled) expect(d).toBeGreaterThan(300);
  });

  it("queues behind a slower car instead of passing through it", () => {
    const path = buildLoop({ x0: -100, z0: -100, x1: 100, z1: 100, lane: 5.5 });
    const sim = new Traffic([
      { path, cruise: 12 },
      { path, cruise: 4 },
    ]);
    sim.cars[0].s = 100;
    sim.cars[1].s = 130;
    sim.sync(sim.cars[0]);
    sim.sync(sim.cars[1]);
    for (let t = 0; t < 60; t += 0.05) {
      sim.update(0.05);
      expect(overlap(sim.cars[0], sim.cars[1])).toBe(false);
    }
    // the fast car ended up matching the slow car's pace
    expect(sim.cars[0].v).toBeLessThan(6);
  });

  it("stops for a visitor standing in the road, asks them to move, then thanks them", () => {
    const path = buildLoop({ x0: -100, z0: -100, x1: 100, z1: 100, lane: 5.5 });
    const sim = new Traffic([{ path, cruise: 10 }]);
    const car = sim.cars[0];
    car.s = 40;
    sim.sync(car);
    // stand 30 studs ahead, in the lane
    const ahead = samplePath(path, car.s + 30);
    const player = { x: ahead.x, z: ahead.z };
    const events = [];
    let stoppedBefore = Infinity;
    for (let t = 0; t < 12; t += 0.05) {
      events.push(...sim.update(0.05, { player }));
      stoppedBefore = Math.min(stoppedBefore, Math.hypot(car.x - player.x, car.z - player.z));
    }
    expect(car.v).toBe(0);
    expect(stoppedBefore).toBeGreaterThan(4); // never touched the visitor
    expect(events.filter((e) => e.type === "ask").length).toBeGreaterThanOrEqual(2); // asks, then asks again
    // the visitor steps aside
    const after = [];
    for (let t = 0; t < 6; t += 0.05) after.push(...sim.update(0.05, { player: { x: player.x + 30, z: player.z + 30 } }));
    expect(after.some((e) => e.type === "thanks")).toBe(true);
    expect(car.v).toBeGreaterThan(2);
  });

  it("ignores a visitor on the pavement", () => {
    const path = buildLoop({ x0: -100, z0: -100, x1: 100, z1: 100, lane: 5.5 });
    const sim = new Traffic([{ path, cruise: 10 }]);
    const car = sim.cars[0];
    car.s = 40;
    sim.sync(car);
    const ahead = samplePath(path, car.s + 30);
    // 10 studs to the side of the lane: where the kerb is
    const player = { x: ahead.x + 10, z: ahead.z + 10 };
    for (let t = 0; t < 5; t += 0.05) sim.update(0.05, { player });
    expect(car.v).toBeGreaterThan(8);
  });

  it("gives way to the tram", () => {
    const path = buildLoop({ x0: -100, z0: -100, x1: 100, z1: 100, lane: 5.5 });
    const sim = new Traffic([{ path, cruise: 10 }]);
    const car = sim.cars[0];
    car.s = 40;
    sim.sync(car);
    const ahead = samplePath(path, car.s + 40);
    const tram = { x: ahead.x, z: ahead.z, hx: -ahead.hz, hz: ahead.hx };
    for (let t = 0; t < 10; t += 0.05) sim.update(0.05, { tram });
    expect(car.v).toBe(0);
    expect(Math.hypot(car.x - tram.x, car.z - tram.z)).toBeGreaterThan(8);
  });

  it("is deterministic for a seed", () => {
    const a = createTraffic(layout, 8, { seed: 5, simSeed: 3 });
    const b = createTraffic(layout, 8, { seed: 5, simSeed: 3 });
    for (let i = 0; i < 200; i++) {
      a.update(0.1);
      b.update(0.1);
    }
    expect(a.cars.map((c) => Math.round(c.x))).toEqual(b.cars.map((c) => Math.round(c.x)));
  });
});
