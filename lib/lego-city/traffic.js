/**
 * Traffic simulation: cars follow closed lane loops, keep a safe gap to the
 * car ahead, give way at crossings, stop for the tram and for a visitor
 * standing in the road, and ask them to move. Pure JS (no renderer), seeded,
 * and unit-tested so "cars never drive through each other" is a checked
 * guarantee rather than a hope.
 */
import { createRng } from "./layout.js";

const CAR_LEN = 8;
const CAR_HALF_W = 2.3;
const MIN_GAP = 3;
const PLAYER_GAP = 5;
const TRAM_GAP = 6;
const ACCEL = 9;
const DECEL = 26;
const COMFORT_BRAKE = 14;

/* ------------------------------------------------------------------ paths */

/**
 * A closed rectangular lane loop with chamfered corners. `dir` 1 = clockwise
 * (inset from the road centrelines), -1 = counter-clockwise (outset), so
 * traffic keeps to the right-hand side like a real street.
 */
export function buildLoop({ x0, z0, x1, z1, lane, dir = 1, chamfer = 6 }) {
  const a = dir === 1 ? [x0 + lane, z0 + lane, x1 - lane, z1 - lane] : [x0 - lane, z0 - lane, x1 + lane, z1 + lane];
  const [lx0, lz0, lx1, lz1] = a;
  // corners in travel order
  const corners =
    dir === 1
      ? [
          [lx0, lz0],
          [lx1, lz0],
          [lx1, lz1],
          [lx0, lz1],
        ]
      : [
          [lx0, lz0],
          [lx0, lz1],
          [lx1, lz1],
          [lx1, lz0],
        ];
  const pts = [];
  for (let i = 0; i < 4; i++) {
    const prev = corners[(i + 3) % 4];
    const cur = corners[i];
    const next = corners[(i + 1) % 4];
    const dIn = unit(cur[0] - prev[0], cur[1] - prev[1]);
    const dOut = unit(next[0] - cur[0], next[1] - cur[1]);
    pts.push({ x: cur[0] - dIn.x * chamfer, z: cur[1] - dIn.z * chamfer });
    pts.push({ x: cur[0] + dOut.x * chamfer, z: cur[1] + dOut.z * chamfer });
  }
  return makePath(pts);
}

/** Centres of every road crossing in the grid. */
export function intersectionCenters(layout) {
  const out = [];
  for (let i = 0; i <= layout.blocks; i++) for (let j = 0; j <= layout.blocks; j++) out.push({ id: out.length, x: layout.roadCoord(i), z: layout.roadCoord(j) });
  return out;
}

/**
 * Stretches of `path` that lie inside an intersection box: [{id, sIn, span}].
 * sIn is where the car's front edge would first touch the box.
 */
export function findZones(path, centers, half) {
  const step = 0.5;
  const n = Math.ceil(path.length / step);
  const inBox = (p) => {
    for (const c of centers) if (Math.abs(p.x - c.x) < half && Math.abs(p.z - c.z) < half) return c.id;
    return -1;
  };
  const ids = [];
  for (let k = 0; k < n; k++) ids.push(inBox(samplePath(path, k * step)));
  let start = ids.findIndex((v) => v === -1);
  if (start < 0) return [];
  const zones = [];
  let cur = null;
  for (let o = 0; o < n; o++) {
    const k = (start + o) % n;
    if (ids[k] !== -1 && (!cur || cur.id !== ids[k])) {
      cur = { id: ids[k], sIn: k * step, span: step };
      zones.push(cur);
    } else if (ids[k] !== -1) {
      cur.span += step;
    } else {
      cur = null;
    }
  }
  return zones;
}

function unit(x, z) {
  const l = Math.hypot(x, z) || 1;
  return { x: x / l, z: z / l };
}

export function makePath(points) {
  const pts = points.map((p) => ({ x: p.x, z: p.z }));
  const cum = [0];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    cum.push(cum[i] + Math.hypot(b.x - a.x, b.z - a.z));
  }
  return { pts, cum, length: cum[cum.length - 1] };
}

export function samplePath(path, s) {
  const L = path.length;
  const t = ((s % L) + L) % L;
  let lo = 0;
  let hi = path.pts.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (path.cum[mid] <= t) lo = mid;
    else hi = mid - 1;
  }
  const a = path.pts[lo];
  const b = path.pts[(lo + 1) % path.pts.length];
  const seg = path.cum[lo + 1] - path.cum[lo] || 1;
  const f = (t - path.cum[lo]) / seg;
  const d = unit(b.x - a.x, b.z - a.z);
  return { x: a.x + (b.x - a.x) * f, z: a.z + (b.z - a.z) * f, hx: d.x, hz: d.z };
}

/** Random loops over the road grid, spread across the city. */
export function planLoops(layout, count, seed = 99) {
  const rng = createRng(seed);
  const { blocks, roadCoord, road } = layout;
  const lane = road / 2 - 2.5;
  const loops = [];
  for (let i = 0; i < count; i++) {
    const a = rng.int(0, blocks - 1);
    const b = rng.int(a + 1, Math.min(blocks, a + 3));
    const c = rng.int(0, blocks - 1);
    const d = rng.int(c + 1, Math.min(blocks, c + 3));
    const dir = i % 2 === 0 ? 1 : -1;
    const plan = { x0: roadCoord(a), z0: roadCoord(c), x1: roadCoord(b), z1: roadCoord(d), lane, dir };
    loops.push({ plan, path: buildLoop(plan), cruise: rng.range(8, 12), dir });
  }
  return loops;
}

const mod = (a, n) => ((a % n) + n) % n;

/* ------------------------------------------------------------- obstacles */

/** Where `ob` sits relative to a vehicle: gap along its heading and sideways clearance. */
export function relate(car, ob) {
  const dx = ob.x - car.x;
  const dz = ob.z - car.z;
  const fwd = dx * car.hx + dz * car.hz;
  const lat = -dx * car.hz + dz * car.hx;
  const cos = ob.hx * car.hx + ob.hz * car.hz;
  const sin = -ob.hx * car.hz + ob.hz * car.hx;
  const ac = Math.abs(cos);
  const as = Math.abs(sin);
  const extF = (ob.len / 2) * ac + (ob.w / 2) * as;
  const extL = (ob.len / 2) * as + (ob.w / 2) * ac;
  return {
    fwd,
    gap: fwd - (car.len ?? CAR_LEN) / 2 - extF,
    latGap: Math.abs(lat) - (car.halfW ?? CAR_HALF_W) - extL,
    cos,
  };
}

/**
 * Exact oriented-box overlap (separating axis theorem). `slack` > 0 shrinks the
 * boxes (touching is fine), negative inflates them (a safety margin).
 */
export function bodiesOverlap(a, b, slack = 0.2) {
  const alen = (a.len ?? CAR_LEN) / 2;
  const aw = (a.w ?? CAR_HALF_W * 2) / 2;
  const blen = (b.len ?? CAR_LEN) / 2;
  const bw = (b.w ?? CAR_HALF_W * 2) / 2;
  const dx = b.x - a.x;
  const dz = b.z - a.z;
  const axes = [
    [a.hx, a.hz],
    [-a.hz, a.hx],
    [b.hx, b.hz],
    [-b.hz, b.hx],
  ];
  for (const [ax, az] of axes) {
    const ra = alen * Math.abs(a.hx * ax + a.hz * az) + aw * Math.abs(-a.hz * ax + a.hx * az);
    const rb = blen * Math.abs(b.hx * ax + b.hz * az) + bw * Math.abs(-b.hz * ax + b.hx * az);
    if (Math.abs(dx * ax + dz * az) > ra + rb - slack) return false;
  }
  return true;
}

/**
 * Earliest time (s) within `horizon` at which `car`, rolling on at its cruise
 * speed, would collide with `ob` carrying on along its own velocity. Bodies
 * are inflated a little so near misses count. Null when the paths stay clear.
 */
export function conflictTime(car, ob, horizon = 2.4) {
  const ovx = ob.vx ?? 0;
  const ovz = ob.vz ?? 0;
  for (let t = 0.2; t <= horizon; t += 0.2) {
    const c = { x: car.x + car.hx * car.cruise * t, z: car.z + car.hz * car.cruise * t, hx: car.hx, hz: car.hz, len: car.len, w: car.w, halfW: car.halfW };
    const o = { ...ob, x: ob.x + ovx * t, z: ob.z + ovz * t };
    if (bodiesOverlap(c, o, -0.8)) return t;
  }
  return null;
}

/* -------------------------------------------------------------------- sim */

export class Traffic {
  constructor(loops, { seed = 7, intersections = null, zoneHalf = 12.5 } = {}) {
    this.rng = createRng(seed);
    this.time = 0;
    this.locks = new Map(); // intersection id -> owning car id
    this.cars = loops.map((loop, i) => ({
      id: i,
      path: loop.path,
      cruise: loop.cruise,
      s: 0,
      v: 0,
      len: CAR_LEN,
      w: CAR_HALF_W * 2,
      halfW: CAR_HALF_W,
      x: 0,
      z: 0,
      hx: 1,
      hz: 0,
      stuck: 0,
      askT: 0,
      asked: 0,
      hold: 0,
      reason: "none",
      lastReason: "none",
      zones: intersections ? findZones(loop.path, intersections, zoneHalf) : [],
      owns: -1,
    }));
    this.place();
    this.events = [];
  }

  /** Spreads cars along their loops without overlapping anything already placed. */
  place() {
    const placed = [];
    for (const car of this.cars) {
      let ok = false;
      for (let attempt = 0; attempt < 80 && !ok; attempt++) {
        car.s = this.rng.range(0, car.path.length);
        this.sync(car);
        const L = car.path.length;
        const clearOfBoxes = car.zones.every((z) => mod(car.s + car.len / 2 - z.sIn, L) > z.span + car.len + 1);
        ok = clearOfBoxes && placed.every((o) => Math.hypot(o.x - car.x, o.z - car.z) > 16);
      }
      placed.push(car);
    }
  }

  sync(car) {
    const p = samplePath(car.path, car.s);
    car.x = p.x;
    car.z = p.z;
    car.hx = p.hx;
    car.hz = p.hz;
  }

  /** Distance from the car's front to the stop line if it has to wait for an intersection, else null. */
  intersectionGap(car) {
    return car.waitGap ?? null;
  }

  /** Releases boxes whose owner has cleared them, then hands free boxes to the nearest waiting cars. */
  updateLocks() {
    for (const car of this.cars) {
      car.waitGap = null;
      if (car.owns < 0) continue;
      const zone = car.zones.find((z) => z.id === car.owns);
      // rel: how far the car's front has travelled past the box edge; occupied while rel in [0, span + len]
      const rel = zone ? mod(car.s + car.len / 2 - zone.sIn, car.path.length) : Infinity;
      if (!zone || rel > zone.span + car.len && rel < car.path.length / 2) {
        if (this.locks.get(car.owns) === car.id) this.locks.delete(car.owns);
        car.owns = -1;
      }
    }
    const cands = [];
    for (const car of this.cars) {
      if (car.owns >= 0 || car.zones.length === 0) continue;
      let best = null;
      for (const z of car.zones) {
        const d = mod(z.sIn - (car.s + car.len / 2) + car.path.length / 2, car.path.length) - car.path.length / 2; // front-to-edge, signed
        const inside = d <= 0 && -d < z.span + car.len;
        if (d > -0.01 && (best === null || d < best.d)) best = { z, d };
        else if (inside) best = { z, d: 0 }; // already in the box without a lock: grab it if we can
      }
      if (best) cands.push({ car, ...best });
    }
    cands.sort((a, b) => a.d - b.d || a.car.id - b.car.id);
    for (const { car, z, d } of cands) {
      // ask early enough that a refusal still leaves room to stop at the line
      const reach = (car.v * car.v) / (2 * COMFORT_BRAKE) * 1.6 + 8;
      if (d > reach + 6) continue;
      const owner = this.locks.get(z.id);
      const free = owner === undefined || owner === car.id;
      if (free && (d <= 0 || (d < reach && this.exitClear(car, z)))) {
        this.locks.set(z.id, car.id);
        car.owns = z.id;
      } else {
        car.waitGap = Math.max(0, d - 1.0);
      }
    }
  }

  /** True when the stretch beyond the box can take this car without it blocking the box (no spill-back). */
  exitClear(car, zone) {
    const L = car.path.length;
    const exit = zone.sIn + zone.span;
    const next = car.zones[(car.zones.indexOf(zone) + 1) % car.zones.length];
    const segLen = mod(next.sIn - exit, L);
    const slot = car.len + 2;
    const capacity = Math.floor(segLen / slot);
    let queued = 0;
    for (const other of this.cars) {
      if (other === car) continue;
      // anything sitting in the exit stretch of our lane and heading our way takes a slot
      for (let d = 0; d < segLen; d += slot / 2) {
        const p = samplePath(car.path, exit + d);
        if (Math.abs(other.x - p.x) < slot / 2 && Math.abs(other.z - p.z) < slot / 2 && other.hx * p.hx + other.hz * p.hz > 0.5) {
          queued++;
          break;
        }
      }
    }
    return queued < Math.max(1, capacity - 1);
  }

  /**
   * obstacles: { player?: {x, z}, tram?: {x, z, hx, hz} } in world space.
   * Returns the events raised this step ("ask", "thanks", "honk").
   */
  update(dt, obstacles = {}) {
    this.time += dt;
    this.events = [];
    this.updateLocks();
    const player = obstacles.player
      ? { x: obstacles.player.x, z: obstacles.player.z, hx: 1, hz: 0, len: 2.4, w: 2.4, vx: obstacles.player.vx ?? 0, vz: obstacles.player.vz ?? 0, kind: "player" }
      : null;
    const tram = obstacles.tram ? { ...obstacles.tram, len: 22, w: 6.4, vx: (obstacles.tram.hx ?? 0) * (obstacles.tram.v ?? 0), vz: (obstacles.tram.hz ?? 0) * (obstacles.tram.v ?? 0), kind: "tram" } : null;

    for (const car of this.cars) {
      let target = car.cruise;
      let reason = "none";
      const consider = (ob, minGap, priority) => {
        const r = relate(car, ob);
        if (r.fwd <= 0 || r.latGap > 0.4) return;
        const look = 10 + car.v * 1.6 + (car.v * car.v) / (2 * COMFORT_BRAKE);
        if (r.gap > look) return;
        if (ob.kind === "car" && !priority && this.locks.size >= 0 && car.zones.length > 0) {
          // with reserved intersections, only cars travelling our way can be in our lane
          if (r.cos < 0.5) return;
        } else if (ob.kind === "car" && !priority) {
          const sameWay = r.cos > 0.5;
          if (!sameWay && ob.v > 0.5 && ob.id > car.id) return; // no intersections: lower id first
        }
        const room = Math.max(0, r.gap - minGap);
        const v = r.gap <= minGap ? 0 : Math.min(car.cruise, Math.sqrt(2 * COMFORT_BRAKE * room));
        if (v < target) {
          target = v;
          reason = ob.kind;
        }
      };
      for (const other of this.cars) {
        if (other === car) continue;
        consider({ x: other.x, z: other.z, hx: other.hx, hz: other.hz, len: other.len, w: other.w, id: other.id, v: other.v, kind: "car" }, MIN_GAP, false);
      }
      if (tram) consider(tram, TRAM_GAP, true);
      if (player) consider(player, PLAYER_GAP, true);

      // look a couple of seconds ahead: anyone crossing our path who has right of way
      const predict = (ob, label) => {
        const tc = conflictTime(car, ob);
        if (tc === null) return;
        const v = tc < 1.5 ? 0 : (car.cruise * (tc - 1.5)) / 0.9;
        if (v < target) {
          target = v;
          reason = label;
        }
      };
      if (car.zones.length === 0) {
        for (const other of this.cars) {
          if (other === car) continue;
          const r = relate(car, other);
          if (r.cos > 0.5 || other.id > car.id) continue; // followers use the gap rule; lower id has priority
          predict({ x: other.x, z: other.z, hx: other.hx, hz: other.hz, len: other.len, w: other.w, vx: other.hx * other.v, vz: other.hz * other.v, kind: "car" }, "car");
        }
      }
      // reserved intersections: wait at the stop line unless the box is ours
      const wait = this.intersectionGap(car);
      if (wait !== null) {
        const v = wait <= 0 ? 0 : Math.min(car.cruise, Math.sqrt(2 * COMFORT_BRAKE * wait));
        if (v < target) {
          target = v;
          reason = "intersection";
        }
      }
      if (tram) predict(tram, "tram");
      if (player) predict(player, "player");

      // patience: a visitor who just stepped aside gets a beat before we roll on
      if (car.reason === "player" && reason !== "player" && car.asked > 0) car.hold = 0.8;
      if (car.hold > 0) {
        car.hold -= dt;
        target = 0;
        if (car.hold <= 0 && car.asked > 0) {
          this.events.push({ type: "thanks", car });
          car.asked = 0;
          car.askT = 0;
        }
      }

      car.lastReason = car.reason;
      car.reason = reason;
      const dv = target - car.v;
      car.v += Math.max(-DECEL * dt, Math.min(ACCEL * dt, dv));
      if (car.v < 0.01) car.v = 0;
      car.s += car.v * dt;
      this.sync(car);

      // the visitor is in the way: ask politely, then honk
      if (reason === "player" && car.v < 0.3) {
        car.askT += dt;
        const due = car.asked === 0 ? 0.6 : 5.5 * car.asked;
        if (car.askT >= due) {
          this.events.push({ type: "ask", car, n: car.asked });
          car.asked += 1;
        }
      } else if (reason !== "player" && car.hold <= 0) {
        car.askT = 0;
      }

      // bookkeeping for tests and the HUD: how long has this car been waiting on traffic
      car.stuck = car.v === 0 && (reason === "car" || reason === "tram") ? car.stuck + dt : 0;
    }

    // last line of defence: never let two cars overlap, whatever the rules said
    for (let i = 0; i < this.cars.length; i++) {
      for (let j = i + 1; j < this.cars.length; j++) {
        const car = this.cars[i];
        const other = this.cars[j];
        if (!bodiesOverlap(car, other)) continue;
        const behind = relate(car, other).fwd > 0 ? car : other;
        behind.s -= 0.6;
        behind.v = 0;
        this.sync(behind);
      }
    }
    return this.events;
  }
}

/** Convenience: a traffic sim for a city layout, with reserved intersections. */
export function createTraffic(layout, count, { seed = 99, simSeed = 7 } = {}) {
  return new Traffic(planLoops(layout, count, seed), { seed: simSeed, intersections: intersectionCenters(layout) });
}
