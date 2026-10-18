/**
 * Turns the city spec into a flat list of brick primitives plus the metadata
 * the runtime needs (colliders, walkable heights, landmarks, tram route).
 *
 * Pure JS, no renderer imports: used by the Three.js scene at runtime and by
 * `tools/city/export-parts.mjs` to feed the Blender script.
 */
import defaultSpec from "./spec.js";
import { createLayout, createRng, GROUND, PLATE, ROAD_TOP, STUD_H } from "./layout.js";
import { Parts } from "./parts.js";
import { buildLot, LOT_GROUND, lampPost, roundTree, pineTree, car, tram, minifig } from "./builders.js";

const GRAY = "light-bluish-gray";
const DGRAY = "dark-bluish-gray";

function rectContains(rect, x, z, pad = 0) {
  return (
    x >= rect.x - rect.w / 2 - pad &&
    x <= rect.x + rect.w / 2 + pad &&
    z >= rect.z - rect.d / 2 - pad &&
    z <= rect.z + rect.d / 2 + pad
  );
}

function buildGround(p, layout, spec) {
  const { half, bounds, blocks, road, roadCoord, blockRect, width } = layout;
  // outer baseplate (grass) and the inner city baseplate
  p.box(0, -1.2, 0, bounds * 2, 1.2, bounds * 2, "green");
  p.box(0, 0, 0, width, ROAD_TOP, width, DGRAY);
  // block plates: sidewalk ring + inner lot plate
  for (const lot of spec.lots) {
    const rect = blockRect(lot.block[0], lot.block[1]);
    const inner = LOT_GROUND[lot.kind] ?? GRAY;
    const sw = layout.sidewalk;
    const ih = rect.innerHalf;
    // sidewalk ring as four strips so studs are not doubled under the inner plate
    p.box(rect.cx, 0, rect.cz - ih - sw / 2, rect.size, GROUND, sw, GRAY, { s: true, mask: true, top: true });
    p.box(rect.cx, 0, rect.cz + ih + sw / 2, rect.size, GROUND, sw, GRAY, { s: true, mask: true, top: true });
    p.box(rect.cx - ih - sw / 2, 0, rect.cz, sw, GROUND, rect.innerSize, GRAY, { s: true, mask: true, top: true });
    p.box(rect.cx + ih + sw / 2, 0, rect.cz, sw, GROUND, rect.innerSize, GRAY, { s: true, mask: true, top: true });
    p.box(rect.cx, 0, rect.cz, rect.innerSize, GROUND, rect.innerSize, inner, { s: true, mask: true, top: true });
  }
  // road markings: dashed centre lines + crosswalks
  for (let i = 0; i <= blocks; i++) {
    const c = roadCoord(i);
    for (let t = -half + road; t < half - road; t += 4) {
      if (Math.abs(((t + half - road) % layout.pitch) - layout.block / 2) > layout.block / 2 - 1) continue;
      p.box(c, ROAD_TOP, t + 1, 0.6, 0.05, 2, "white");
      p.box(t + 1, ROAD_TOP, c, 2, 0.05, 0.6, "white");
    }
    for (let j = 0; j <= blocks; j++) {
      const cz = roadCoord(j);
      for (const side of [-1, 1]) {
        for (let k = -3; k <= 3; k++) {
          p.box(c + k * 1.3, ROAD_TOP, cz + side * (road / 2 + 1.2), 0.7, 0.05, 2, "white");
          p.box(c + side * (road / 2 + 1.2), ROAD_TOP, cz + k * 1.3, 2, 0.05, 0.7, "white");
        }
      }
    }
  }
  // lamp posts on every block corner
  for (const lot of spec.lots) {
    const rect = blockRect(lot.block[0], lot.block[1]);
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      lampPost(p, rect.cx + sx * (rect.half - 1.2), rect.cz + sz * (rect.half - 1.2), { height: 7 });
    }
  }
}

function buildOutskirts(p, layout) {
  const rng = createRng(2024);
  const { half, bounds } = layout;
  // ring of trees + a couple of stepped hills so the horizon isn't empty
  for (let i = 0; i < 140; i++) {
    const side = rng.int(0, 3);
    const t = rng.range(-bounds + 2, bounds - 2);
    const depth = rng.range(half + 3, bounds - 2);
    const [x, z] = side === 0 ? [t, -depth] : side === 1 ? [t, depth] : side === 2 ? [-depth, t] : [depth, t];
    if (Math.abs(x) <= half + 2 && Math.abs(z) <= half + 2) continue;
    if (rng.chance(0.5)) pineTree(p, x, z, { size: rng.range(0.9, 1.6), leaf: rng.pick(["green", "dark-green"]) });
    else roundTree(p, x, z, { size: rng.range(0.9, 1.5), leaf: rng.pick(["bright-green", "green"]), solid: false });
  }
  for (const [x, z, r] of [[-bounds + 8, -bounds + 8, 14], [bounds - 10, bounds - 6, 12], [bounds - 6, -bounds + 10, 10]]) {
    let y = 0;
    for (let k = 0; k < 4; k++) {
      p.cyl(x, y, z, r - k * 3, 1.2, k < 2 ? "green" : "bright-green");
      y += 1.2;
    }
  }
  // invisible walls
  const wall = bounds - 2;
  p.blocker(0, -wall, bounds * 2, 2);
  p.blocker(0, wall, bounds * 2, 2);
  p.blocker(-wall, 0, 2, bounds * 2);
  p.blocker(wall, 0, 2, bounds * 2);
}

function buildRoute(p, layout, spec) {
  const pts = spec.route.path.map(layout.pathPoint);
  const points = [];
  let length = 0;
  for (let i = 0; i < pts.length; i++) {
    if (i > 0) length += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].z - pts[i - 1].z);
    points.push({ ...pts[i], t: length });
  }
  // rails along the path
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    const len = Math.hypot(dx, dz);
    const mx = (a.x + b.x) / 2;
    const mz = (a.z + b.z) / 2;
    const horizontal = Math.abs(dx) > Math.abs(dz);
    for (const off of [-1.6, 1.6]) {
      if (horizontal) p.box(mx, ROAD_TOP, mz + off, len + 2, 0.15, 0.4, "chrome-silver");
      else p.box(mx + off, ROAD_TOP, mz, 0.4, 0.15, len + 2, "chrome-silver");
    }
    const ties = Math.floor(len / 2.5);
    for (let k = 0; k <= ties; k++) {
      const f = k / ties;
      const x = a.x + dx * f;
      const z = a.z + dz * f;
      if (horizontal) p.box(x, ROAD_TOP, z, 0.8, 0.08, 4, DGRAY);
      else p.box(x, ROAD_TOP, z, 4, 0.08, 0.8, DGRAY);
    }
  }
  const distanceAlong = (pt) => {
    let best = { t: 0, dist: Infinity };
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1];
      const b = points[i];
      const abx = b.x - a.x;
      const abz = b.z - a.z;
      const len2 = abx * abx + abz * abz;
      let u = ((pt.x - a.x) * abx + (pt.z - a.z) * abz) / len2;
      u = Math.max(0, Math.min(1, u));
      const px = a.x + abx * u;
      const pz = a.z + abz * u;
      const dist = Math.hypot(pt.x - px, pt.z - pz);
      if (dist < best.dist) best = { t: a.t + Math.sqrt(len2) * u, dist };
    }
    return best.t;
  };
  const stops = spec.route.stops.map((stop) => {
    const pt = layout.pathPoint(stop.at);
    return { ...stop, x: pt.x, z: pt.z, t: distanceAlong(pt) };
  });
  return { name: spec.route.name, points, stops, length };
}

function buildTraffic(p, layout, spec) {
  const rng = createRng(99);
  const colors = ["bright-red", "white", "bright-yellow", "dark-azure", "lime", "black", "orange"];
  const count = spec.traffic?.cars ?? 6;
  const { roadCoord, blocks, half, road } = layout;
  for (let i = 0; i < count; i++) {
    // each car drives a rectangular loop around one block ring, clockwise
    const ring = rng.int(0, blocks - 1);
    const c0 = roadCoord(0) + 2.2 * (i % 2 ? 1 : -1);
    const c1 = roadCoord(ring + 1) + 2.2 * (i % 2 ? 1 : -1);
    const loop = [
      { x: c0, z: c0 },
      { x: c1, z: c0 },
      { x: c1, z: c1 },
      { x: c0, z: c1 },
    ];
    void half;
    void road;
    p.push(loop[0].x, loop[0].z, 0);
    p.beginDynamic("car", { loop, speed: rng.range(7, 11), offset: rng.range(0, 1) });
    car(p, 0, 0, 0, { color: colors[i % colors.length] });
    p.endDynamic();
    p.pop();
  }
}

function buildTram(p, route) {
  const first = route.points[0];
  const second = route.points[1];
  const dx = second.x - first.x;
  const dz = second.z - first.z;
  // local -z is forward; rotate quarter turns so forward matches the first segment
  const rot = Math.abs(dx) > Math.abs(dz) ? (dx > 0 ? 1 : 3) : dz > 0 ? 2 : 0;
  p.push(first.x, first.z, rot);
  p.beginDynamic("tram", {});
  tram(p, {});
  p.endDynamic();
  p.pop();
}

function generateStuds(parts, colliders) {
  const studs = {};
  const footprints = colliders.filter((c) => c.w * c.d > 4);
  for (const item of parts.items) {
    if (!item.s || item.t !== "box" || item.g) continue;
    const cols = Math.round(item.w);
    const rows = Math.round(item.d);
    if (cols < 1 || rows < 1) continue;
    const y = item.y + item.h;
    const x0 = item.x - cols / 2 + 0.5;
    const z0 = item.z - rows / 2 + 0.5;
    const list = (studs[item.c] ??= []);
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = x0 + i;
        const z = z0 + j;
        if (item.mask && footprints.some((f) => rectContains(f, x, z, 0.3))) continue;
        list.push(x, y, z);
      }
    }
  }
  return studs;
}

export function compileCity(spec = defaultSpec) {
  const layout = createLayout(spec.grid);
  const p = new Parts();

  buildGround(p, layout, spec);
  for (const lot of spec.lots) {
    const rect = layout.blockRect(lot.block[0], lot.block[1]);
    p.push(rect.cx, rect.cz, rect.facing === 1 ? 0 : 2, { lot: lot.id });
    buildLot(p, lot);
    p.pop();
  }
  buildOutskirts(p, layout);
  const route = buildRoute(p, layout, spec);
  buildTraffic(p, layout, spec);
  buildTram(p, route);

  const studs = generateStuds(p, p.colliders);

  // spawn on the station platform, facing north toward the square
  const spawnLot = spec.lots.find((l) => l.id === spec.spawn.lot);
  const spawnRect = layout.blockRect(spawnLot.block[0], spawnLot.block[1]);
  const spawn = { x: spawnRect.cx, z: spawnRect.cz + 6, yaw: 0 };

  const landmarks = p.landmarks.map((lm) => {
    const lot = spec.lots.find((l) => l.id === lm.lotId);
    return { ...lm, y: GROUND, kind: lot.kind, color: lot.color, project: lot.project, content: lot.content };
  });

  const districts = spec.districts.map((d) => ({
    ...d,
    z: d.rows.reduce((acc, r) => acc + layout.blockRect(0, r).cz, 0) / d.rows.length,
  }));

  return {
    name: spec.name,
    tagline: spec.tagline,
    spec,
    layout,
    items: p.items,
    studs,
    studHeight: STUD_H,
    colliders: p.colliders,
    heights: p.heights,
    labels: p.labels,
    landmarks,
    dynamic: p.dynamic,
    route,
    spawn,
    districts,
    lots: spec.lots.map((lot) => ({ ...lot, rect: layout.blockRect(lot.block[0], lot.block[1]) })),
    bounds: layout.bounds,
    groundTop: GROUND,
    plate: PLATE,
  };
}

/** JSON-serialisable subset for external tools (Blender). */
export function serializeCity(city) {
  return {
    name: city.name,
    tagline: city.tagline,
    units: city.spec.units,
    bounds: city.bounds,
    items: city.items,
    studs: city.studs,
    studHeight: city.studHeight,
    labels: city.labels,
    landmarks: city.landmarks.map(({ content, ...rest }) => rest),
    dynamic: city.dynamic,
    route: city.route,
    spawn: city.spawn,
    lots: city.lots.map(({ content, ...lot }) => lot),
  };
}

export { minifig };
