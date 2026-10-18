import { finishFor, colorHex } from "./palette.js";

const DIRS = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] };
const DIR_NAMES = Object.entries(DIRS);

function rotateVec([x, z], rot) {
  // quarter turns about +y (right-handed, y up): (x, z) -> (-z, x)
  let rx = x;
  let rz = z;
  for (let k = 0; k < ((rot % 4) + 4) % 4; k++) {
    const nx = -rz;
    const nz = rx;
    rx = nx;
    rz = nz;
  }
  return [rx, rz];
}

function rotateDir(dir, rot) {
  const [vx, vz] = rotateVec(DIRS[dir], rot);
  for (const [name, [x, z]] of DIR_NAMES) if (x === vx && z === vz) return name;
  return dir;
}

/**
 * Collects brick primitives in a local frame, transforming them into world space.
 * All primitives use (x, z) centre and y = bottom. Sizes are in studs.
 */
export class Parts {
  constructor() {
    this.items = [];
    this.colliders = [];
    this.heights = [];
    this.labels = [];
    this.landmarks = [];
    this.dynamic = [];
    this.frames = [];
    this.frame = { x: 0, z: 0, rot: 0, group: null, lot: null };
  }

  push(x = 0, z = 0, rot = 0, extra = {}) {
    this.frames.push(this.frame);
    const parent = this.frame;
    const [wx, wz] = rotateVec([x, z], parent.rot);
    this.frame = {
      x: parent.x + wx,
      z: parent.z + wz,
      rot: parent.rot + rot,
      group: extra.group ?? parent.group,
      lot: extra.lot ?? parent.lot,
    };
  }

  pop() {
    this.frame = this.frames.pop();
  }

  world(x, z) {
    const [wx, wz] = rotateVec([x, z], this.frame.rot);
    return [this.frame.x + wx, this.frame.z + wz];
  }

  size(w, d) {
    return this.frame.rot % 2 === 0 ? [w, d] : [d, w];
  }

  /** Axis-aligned box. opts: s (studs on top), solid, m (finish), mask, group, part, top (walkable height) */
  box(x, y, z, w, h, d, c, opts = {}) {
    const [wx, wz] = this.world(x, z);
    const [ww, wd] = this.size(w, d);
    const item = {
      t: "box",
      x: wx,
      y,
      z: wz,
      w: ww,
      h,
      d: wd,
      c,
      m: opts.m ?? finishFor(c),
    };
    if (opts.s) item.s = true;
    if (opts.mask) item.mask = true;
    this.tag(item, opts);
    this.items.push(item);
    if (opts.solid && !this.frame.group) this.colliders.push({ x: wx, z: wz, w: ww, d: wd, lot: this.frame.lot });
    if (opts.top) this.heights.push({ x: wx, z: wz, w: ww, d: wd, top: y + h });
    return item;
  }

  /**
   * Cylinder. axis: 'y' (default, y = bottom), or 'x' / 'z' (y = centre).
   * seg: radial segments (4 = pyramid-ish).
   */
  cyl(x, y, z, r, h, c, opts = {}) {
    const [wx, wz] = this.world(x, z);
    let axis = opts.axis ?? "y";
    if (axis !== "y" && this.frame.rot % 2 !== 0) axis = axis === "x" ? "z" : "x";
    const item = { t: "cyl", x: wx, y, z: wz, r, h, c, m: opts.m ?? finishFor(c), axis };
    if (opts.seg) item.seg = opts.seg;
    if (opts.s) item.s = true;
    this.tag(item, opts);
    this.items.push(item);
    if (opts.solid && !this.frame.group) this.colliders.push({ x: wx, z: wz, w: r * 2, d: r * 2, lot: this.frame.lot });
    if (opts.top) this.heights.push({ x: wx, z: wz, w: r * 2, d: r * 2, top: y + h });
    return item;
  }

  cone(x, y, z, r, h, c, opts = {}) {
    const [wx, wz] = this.world(x, z);
    const item = { t: "cone", x: wx, y, z: wz, r, h, c, m: opts.m ?? finishFor(c) };
    if (opts.seg) item.seg = opts.seg;
    this.tag(item, opts);
    this.items.push(item);
    return item;
  }

  /** Wedge (slope brick). `dir` is the side the slope faces (the low side). */
  wedge(x, y, z, w, h, d, dir, c, opts = {}) {
    const [wx, wz] = this.world(x, z);
    const [ww, wd] = this.size(w, d);
    const item = {
      t: "wedge",
      x: wx,
      y,
      z: wz,
      w: ww,
      h,
      d: wd,
      dir: rotateDir(dir, this.frame.rot),
      c,
      m: opts.m ?? finishFor(c),
    };
    this.tag(item, opts);
    this.items.push(item);
    if (opts.solid && !this.frame.group) this.colliders.push({ x: wx, z: wz, w: ww, d: wd, lot: this.frame.lot });
    return item;
  }

  tag(item, opts) {
    if (this.frame.group) item.g = this.frame.group;
    if (opts.part) item.part = opts.part;
    if (opts.emissive) item.e = true;
  }

  /** Blocks walking without drawing anything. */
  blocker(x, z, w, d) {
    const [wx, wz] = this.world(x, z);
    const [ww, wd] = this.size(w, d);
    this.colliders.push({ x: wx, z: wz, w: ww, d: wd, lot: this.frame.lot });
  }

  label(text, x, y, z, opts = {}) {
    const [wx, wz] = this.world(x, z);
    this.labels.push({ text, x: wx, y, z: wz, ...opts });
  }

  landmark(data, x, z, facing = "s") {
    const [wx, wz] = this.world(x, z);
    this.landmarks.push({ ...data, x: wx, z: wz, facing: rotateDir(facing, this.frame.rot) });
  }

  /** Start a dynamic (animated) group; parts pushed until `endDynamic` are tagged with it. */
  beginDynamic(kind, data = {}) {
    const id = `${kind}-${this.dynamic.length}`;
    const [wx, wz] = this.world(0, 0);
    this.dynamic.push({ id, kind, x: wx, z: wz, rot: this.frame.rot, ...data });
    this.push(0, 0, 0, { group: id });
    return id;
  }

  endDynamic() {
    this.pop();
  }

  toJSON() {
    return {
      items: this.items,
      colliders: this.colliders,
      heights: this.heights,
      labels: this.labels,
      landmarks: this.landmarks,
      dynamic: this.dynamic,
    };
  }
}

export function partColorHex(item) {
  return colorHex(item.c);
}
