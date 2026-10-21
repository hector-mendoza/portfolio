/**
 * Landmark builders for the travel cities (Madrid, Paris, Rome, Punta Cana) and
 * their water lots. Same rules as builders.js: local frame, +z faces the road,
 * everything emitted through `Parts`. Imported for its side effect of
 * registering the new lot kinds.
 */
import { FLOOR, GROUND, PLATE } from "./layout.js";
import {
  band,
  bench,
  door,
  flowerBed,
  gableRoof,
  jet,
  lampPost,
  minifig,
  mosaicSign,
  palmTree,
  pineTree,
  registerBuilders,
  roundTree,
  shell,
  windowsAlong,
} from "./builders.js";

const G = GROUND;
const GRAY = "light-bluish-gray";
const DGRAY = "dark-bluish-gray";
const STONE = "tan";
const GLASS = "trans-light-blue";

/* ----------------------------------------------------------------- shared */

function plate(p, w, d, color, z = 0, x = 0) {
  p.box(x, G, z, w, 0.3, d, color, { top: true });
}

function sign(p, lot, y, z, radius = 10, frontZ = 15) {
  p.label(lot.label, 0, y, z);
  p.landmark({ id: lot.id, lotId: lot.id, title: lot.label, radius }, 0, frontZ, "s");
}

function column(p, x, z, h, r = 0.9, color = STONE) {
  p.cyl(x, G, z, r * 1.25, 0.6, color);
  p.cyl(x, G + 0.6, z, r, h - 1.4, color, { solid: true });
  p.cyl(x, G + h - 0.8, z, r * 1.25, 0.8, color);
}

/** Stepped (LEGO-style) triangle pediment, one course per row. */
function pediment(p, x, y, z, w, d, color) {
  for (let i = 0; w - i * 2.4 > 1; i++) p.box(x, y + i * 0.8, z, w - i * 2.4, 0.8, d, color);
}

function balustrade(p, x, y, z, w, d, color = STONE) {
  p.box(x, y, z, w, 0.4, d, color);
  for (let t = -w / 2 + 0.6; t <= w / 2 - 0.5; t += 1.4) p.box(x + t, y + 0.4, z, 0.5, 0.9, 0.5, color);
  p.box(x, y + 1.3, z, w, 0.3, d, color);
}

function visitor(p, x, z, rot, outfit) {
  p.push(x, z, rot);
  minifig(p, outfit);
  p.pop();
}

/* --------------------------------------------------------------- Madrid */

function buildGate(p, lot) {
  const h = 9;
  plate(p, 28, 22, "dark-tan");
  // five openings between six granite piers: walk straight through the middle one
  for (const x of [-11, -6.6, -2.2, 2.2, 6.6, 11]) p.box(x, G, 0, 2, h, 5, STONE, { solid: true });
  for (const x of [-8.8, -4.4, 4.4, 8.8]) p.box(x, G + h - 1.2, 0, 2.4, 1.2, 5, STONE);
  p.box(0, G + h - 0.8, 0, 2.4, 0.8, 5, STONE);
  p.box(0, G + h, 0, 26, 1.4, 5.6, "white");
  p.box(0, G + h + 1.4, 0, 24, 2.6, 5, STONE);
  for (const x of [-9, -3, 3, 9]) p.box(x, G + h + 1.8, 2.55, 2.2, 1.6, 0.3, "dark-tan");
  p.box(0, G + h + 4, 0, 14, 0.8, 5.2, "white");
  pediment(p, 0, G + h + 4.8, 0, 10, 5, STONE);
  // sculpture groups on the attic
  for (const x of [-10, 10]) {
    p.box(x, G + h + 4, 0, 2.4, 1.2, 2.4, "white");
    p.box(x, G + h + 5.2, 0, 1.2, 2.2, 1.2, "dark-tan");
  }
  p.box(0, G + h + 8.4, 0, 2.2, 1, 2.2, "dark-tan");
  balustrade(p, 0, G + h + 4, 0, 6, 0.6, "white");
  for (const x of [-12, 12]) roundTree(p, x, -8, { size: 0.9 });
  for (const x of [-7, 7]) bench(p, x, 8.5, 2);
  lampPost(p, -13, 10);
  lampPost(p, 13, 10);
  visitor(p, 0, 8, 2, { torso: "bright-red", legs: "dark-blue", hair: "black" });
  sign(p, lot, G + h + 12, 0, 10, 13);
}

function buildPalace(p, lot, rng) {
  plate(p, 28, 28, "dark-tan");
  const w = 26;
  const d = 10;
  const h = FLOOR * 2;
  p.push(0, -6, 0);
  shell(p, w, d, G, h, "white", { s: true, solid: true });
  band(p, w, d, G + FLOOR - PLATE, STONE);
  band(p, w, d, G + h - PLATE, STONE);
  for (const row of [2, FLOOR + 2]) {
    windowsAlong(p, "x", G + row, w - 6, d / 2, { count: 8, w: 1.6, h: 3.4, glass: GLASS, skip: row === 2 ? [3, 4] : [] });
    windowsAlong(p, "x", G + row, w - 6, -d / 2, { count: 8, w: 1.6, h: 3.4, glass: GLASS });
  }
  balustrade(p, 0, G + h, 0, w, d + 0.4);
  // corner pavilions with slate roofs
  for (const sx of [-1, 1]) {
    p.box(sx * (w / 2 - 1.5), G, d / 2 + 0.6, 5, h, 1.4, "white");
    p.box(sx * (w / 2 - 1.5), G + h, 0, 6, 1.4, d + 1, STONE);
    p.cone(sx * (w / 2 - 1.5), G + h + 1.4, 0, 4.6, 3.6, DGRAY, { seg: 4 });
  }
  // central portico
  for (const x of [-3.6, -1.2, 1.2, 3.6]) column(p, x, d / 2 + 2, h - 1);
  p.box(0, G + h - 1, d / 2 + 1.6, 11, 1, 3.4, "white");
  pediment(p, 0, G + h, d / 2 + 1.6, 11, 3.2, "white");
  door(p, 0, G, d / 2 + 0.1, 4.4, 6.4, "dark-tan");
  p.pop();
  // Plaza de Oriente: parterres, hedges, statues
  flowerBed(p, -7, 8, 8, 6, rng);
  flowerBed(p, 7, 8, 8, 6, rng);
  for (const x of [-12, 12]) p.box(x, G, 8, 1.4, 2.2, 8, "dark-green", { solid: true });
  for (const x of [-3, 3]) {
    p.box(x, G, 9, 1.4, 1.8, 1.4, "white", { solid: true });
    p.box(x, G + 1.8, 9, 0.8, 2, 0.8, "dark-tan");
  }
  visitor(p, 0, 10, 2, { torso: "dark-azure", legs: "black", hat: "white" });
  lampPost(p, -13, 13);
  lampPost(p, 13, 13);
  sign(p, lot, G + h + 9, -6, 11, 13.5);
}

function buildArcade(p, lot) {
  const red = lot.color ?? "dark-orange";
  plate(p, 28, 28, "dark-tan");
  const h = FLOOR * 3;
  // four terracotta fronts with an arcaded ground floor and balconies; a gap on the street side
  const wall = (x, z, w, d, along) => {
    p.box(x, G, z, w, h, d, red, { solid: true });
    p.box(x, G + h, z, w + 0.6, 0.6, d + 0.6, "reddish-brown");
    for (let f = 0; f < 3; f++) {
      const y = G + 2 + f * FLOOR;
      const inside = along === "x" ? z + (z < 0 ? 1 : -1) * (d / 2 + 0.1) : null;
      for (let t = -w / 2 + 1.8; t <= w / 2 - 1.6 && along === "x"; t += 3.2) {
        p.box(x + t, y, inside, 1.4, 3, 0.4, f === 0 ? "black" : GLASS);
        if (f > 0) p.box(x + t, y - 0.2, inside + (z < 0 ? 0.5 : -0.5), 2, 0.3, 0.9, "black");
      }
      for (let t = -d / 2 + 1.8; t <= d / 2 - 1.6 && along === "z"; t += 3.2) {
        const inx = x + (x < 0 ? 1 : -1) * (w / 2 + 0.1);
        p.box(inx, y, z + t, 0.4, 3, 1.4, f === 0 ? "black" : GLASS);
      }
    }
  };
  wall(0, -12.5, 26, 3, "x");
  wall(-12.5, 0, 3, 26, "z");
  wall(12.5, 0, 3, 26, "z");
  wall(-8.5, 12.5, 9, 3, "x");
  wall(8.5, 12.5, 9, 3, "x");
  // the bakery house: two towers with grey spires on the north side
  for (const x of [-6, 6]) {
    p.box(x, G + h, -12.5, 4.4, 5, 4.4, red);
    p.cone(x, G + h + 5, -12.5, 3.6, 5, DGRAY, { seg: 4 });
    p.box(x, G + h + 6.4, -10.2, 1.4, 1.4, 0.3, "white");
  }
  p.box(0, G + 2, -10.8, 10, 4.4, 0.4, "bright-light-orange"); // painted mural
  p.box(0, G + 7, -10.8, 10, 3.8, 0.4, "medium-azure");
  // statue of the king on his horse
  p.box(0, G, 0, 4, 2, 4, "white", { solid: true });
  p.box(0, G + 2, 0, 2.4, 2.6, 2.4, "dark-tan");
  p.box(0, G + 4.6, 0, 1.2, 1.5, 3.4, "reddish-brown");
  p.box(0, G + 6.1, -0.4, 0.9, 1.4, 0.9, "dark-green");
  for (const x of [-7, 7]) for (const z of [-4, 4]) {
    p.box(x, G, z, 2, 0.6, 2, "white");
    lampPost(p, x, z, { height: 7 });
  }
  for (const [x, z] of [[-6, 6], [6, 6], [-3, -6], [3, -6]]) visitor(p, x, z, (x + z) % 4, { torso: ["bright-yellow", "dark-azure", "lime", "bright-pink"][(x + z + 20) % 4], legs: "dark-blue", hair: "black" });
  sign(p, lot, G + h + 12, -12.5, 11, 15);
}

function buildCibeles(p, lot) {
  plate(p, 28, 28, "tan");
  p.cyl(0, G, 0, 12.5, 0.5, "dark-tan");
  p.cyl(0, G + 0.5, 0, 11.4, 0.7, "white", { solid: true });
  p.cyl(0, G + 0.6, 0, 10.4, 0.8, GLASS);
  p.cyl(0, G + 1.2, 0, 4.4, 1.4, "white", { solid: true });
  p.cyl(0, G + 2.6, 0, 3.4, 1.4, "tan");
  // the chariot: goddess, wheels and two lions
  p.box(0, G + 4, 0, 4, 1, 5.4, "white");
  p.box(0, G + 5, 0.6, 2.2, 1.4, 2.4, "white");
  p.box(0, G + 6.4, 0.6, 1.1, 1.6, 1.1, "tan");
  p.box(0, G + 8, 0.6, 1.3, 0.5, 1.3, "pearl-gold");
  for (const sx of [-1, 1]) {
    p.cyl(sx * 2.2, G + 4.6, 0.8, 1.3, 0.5, "dark-tan", { axis: "x" });
    p.box(sx * 1.4, G + 4, -4.6, 1.2, 1.4, 2.6, "bright-light-orange");
    p.box(sx * 1.4, G + 5.4, -5.4, 1.2, 1.2, 1.2, "bright-light-orange");
  }
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2 + 0.3;
    p.box(Math.cos(a) * 8, G + 1.3, Math.sin(a) * 8, 0.5, 1.4, 0.5, "trans-clear");
  }
  for (const [x, z] of [[-12, -12], [12, -12], [-12, 12], [12, 12]]) {
    roundTree(p, x, z, { size: 0.85 });
    lampPost(p, x * 0.9, z * 0.9, { height: 8 });
  }
  bench(p, -8, 12, 2);
  bench(p, 8, 12, 2);
  sign(p, lot, G + 13, 0, 11, 14);
}

function buildStadium(p, lot) {
  plate(p, 28, 28, "dark-bluish-gray");
  const w = 26;
  const d = 24;
  p.box(0, G, 0, 18, 0.3, 12, "bright-green", { top: true });
  p.box(0, G + 0.3, 0, 0.3, 0.05, 12, "white");
  p.cyl(0, G + 0.3, 0, 2, 0.05, "white");
  for (const x of [-8.6, 8.6]) p.box(x, G + 0.3, 0, 0.8, 0.5, 3.6, "white");
  // stepped stands on all four sides, rising away from the pitch
  for (let i = 0; i < 4; i++) {
    const inset = 10 + i * 0.9;
    const y = G + 0.3 + i * 1.8;
    const c = i % 2 ? "white" : "bright-blue";
    p.box(0, y, -(7 + i * 1.5), w - i * 1.2, 1.8, 1.5, c);
    p.box(0, y, 7 + i * 1.5, w - i * 1.2, 1.8, 1.5, c);
    p.box(-inset - i * 0.4, y, 0, 1.5, 1.8, d - 12 - i * 0.6, c);
    p.box(inset + i * 0.4, y, 0, 1.5, 1.8, d - 12 - i * 0.6, c);
  }
  // facade, with an entrance on the street side
  p.box(0, G, -d / 2 - 0.3, w, 12, 1.6, "white", { solid: true });
  p.box(-w / 2 - 0.3, G, 0, 1.6, 12, d, "white", { solid: true });
  p.box(w / 2 + 0.3, G, 0, 1.6, 12, d, "white", { solid: true });
  p.box(-8, G, d / 2 + 0.3, 10, 12, 1.6, "white", { solid: true });
  p.box(8, G, d / 2 + 0.3, 10, 12, 1.6, "white", { solid: true });
  p.box(0, G + 8, d / 2 + 0.3, 6, 4, 1.6, "white");
  for (const x of [-9, -5, 5, 9]) p.box(x, G + 1.6, d / 2 + 1.2, 2, 5, 0.3, "bright-blue");
  p.box(0, G + 12, 0, w + 1.4, 0.8, d + 1.4, GRAY);
  for (const [x, z] of [[-12, -11], [12, -11], [-12, 11], [12, 11]]) {
    p.cyl(x, G + 12.8, z, 0.4, 7, DGRAY);
    p.box(x, G + 19.6, z, 2.4, 1.4, 1, "trans-yellow", { emissive: true });
  }
  mosaicSign(p, ["REAL"], 0, G + 5, d / 2 + 1.5, { color: "white", bg: "bright-blue", cell: 0.7, depth: 0.5 });
  sign(p, lot, G + 24, 0, 11, 15);
}

/* --------------------------------------------------------------- Paris */

function buildEiffel(p, lot, rng) {
  const iron = "reddish-brown";
  plate(p, 28, 28, "bright-green");
  p.box(0, G, 0, 3, 0.3, 28, "tan");
  p.box(0, G, 0, 28, 0.3, 3, "tan");
  // four legs, three stages, one spire
  const leg = (cx, y, h, w) => {
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) p.box(sx * cx, y, sz * cx, w, h, w, iron, { solid: y === G });
  };
  leg(8.6, G, 8, 1.8);
  p.box(0, G + 6.6, 8.6, 14, 1.4, 1.4, iron);
  p.box(0, G + 6.6, -8.6, 14, 1.4, 1.4, iron);
  p.box(8.6, G + 6.6, 0, 1.4, 1.4, 14, iron);
  p.box(-8.6, G + 6.6, 0, 1.4, 1.4, 14, iron);
  p.box(0, G + 8, 0, 20, 1.2, 20, "dark-orange");
  p.box(0, G + 9.2, 0, 17, 0.5, 17, iron);
  leg(5.2, G + 9.2, 14, 1.4);
  for (const y of [11.5, 16, 20]) {
    p.box(0, G + y, 5.2, 10, 0.6, 0.6, iron);
    p.box(0, G + y, -5.2, 10, 0.6, 0.6, iron);
    p.box(5.2, G + y, 0, 0.6, 0.6, 10, iron);
    p.box(-5.2, G + y, 0, 0.6, 0.6, 10, iron);
  }
  p.box(0, G + 23.2, 0, 13, 1, 13, "dark-orange");
  leg(2.4, G + 24.2, 17, 1.1);
  for (const y of [27, 32, 37]) {
    p.box(0, G + y, 2.4, 3.6, 0.5, 0.5, iron);
    p.box(0, G + y, -2.4, 3.6, 0.5, 0.5, iron);
    p.box(2.4, G + y, 0, 0.5, 0.5, 3.6, iron);
    p.box(-2.4, G + y, 0, 0.5, 0.5, 3.6, iron);
  }
  p.box(0, G + 41.2, 0, 6.4, 0.8, 6.4, "dark-orange");
  p.box(0, G + 42, 0, 3.6, 1.8, 3.6, GLASS);
  p.cyl(0, G + 43.8, 0, 0.9, 6, iron);
  p.cyl(0, G + 49.8, 0, 0.35, 6, iron);
  p.cyl(0, G + 55.8, 0, 0.5, 0.5, "trans-yellow", { emissive: true });
  p.light("accent", 0, G + 56.2, 0, { c: "trans-yellow", size: 3 });
  for (const [x, z] of [[-11, -11], [11, -11], [-11, 11], [11, 11]]) roundTree(p, x, z, { size: 0.8, leaf: "bright-green" });
  for (const x of [-9, 9]) bench(p, x, 4, 1);
  visitor(p, 3, 7, 2, { torso: "dark-azure", legs: "black", hair: "reddish-brown" });
  visitor(p, -4, 9, 1, { torso: "bright-pink", legs: "dark-blue", hat: "black" });
  void rng;
  sign(p, lot, G + 61, 0, 12, 14);
}

function triumphalArch(p, x, z, { w = 20, d = 11, h = 17 } = {}) {
  const gap = w * 0.36;
  const pier = (w - gap) / 2;
  for (const s of [-1, 1]) p.box(x + s * (gap / 2 + pier / 2), G, z, pier, h, d, STONE, { solid: true });
  p.box(x, G + h * 0.66, z, gap + 0.2, h * 0.34, d, STONE);
  p.box(x, G + h, z, w + 1, 1.2, d + 1, "white");
  p.box(x, G + h + 1.2, z, w - 1, h * 0.2, d - 0.6, STONE);
  for (const s of [-1, 1]) {
    p.box(x + s * (gap / 2 + pier / 2), G + h * 0.4, z + d / 2 + 0.2, pier - 1.6, h * 0.34, 0.4, "dark-tan");
    p.box(x + s * (gap / 2 + pier / 2), G + h * 0.4, z - d / 2 - 0.2, pier - 1.6, h * 0.34, 0.4, "dark-tan");
  }
  p.box(x, G + h * 0.66 - 0.3, z + d / 2 + 0.2, gap, 0.3, 0.3, "dark-tan");
}

function buildArc(p, lot) {
  plate(p, 28, 28, "dark-bluish-gray");
  p.cyl(0, G + 0.3, 0, 13, 0.1, "dark-bluish-gray");
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    p.box(Math.cos(a) * 11.5, G + 0.4, Math.sin(a) * 11.5, 0.5, 0.05, 2.4, "white");
  }
  p.cyl(0, G + 0.3, 0, 8, 0.2, "tan");
  triumphalArch(p, 0, 0);
  p.cyl(0, G, 0, 0.6, 0.6, "dark-orange");
  p.cyl(0, G + 0.6, 0, 0.3, 0.8, "orange", { emissive: true });
  p.light("accent", 0, G + 1.6, 0, { c: "trans-red", size: 1.5 });
  for (const [x, z] of [[-12, -12], [12, -12], [-12, 12], [12, 12]]) lampPost(p, x, z, { height: 8 });
  sign(p, lot, G + 26, 0, 11, 14);
}

function buildPyramid(p, lot) {
  plate(p, 28, 28, "tan");
  // palace wings around the courtyard, open to the street
  const wing = (x, z, w, d) => {
    p.box(x, G, z, w, FLOOR * 2, d, STONE, { solid: true, s: true });
    band(p, w, d, FLOOR * 2 - PLATE, "white");
    p.box(x, G + FLOOR * 2, z, w + 0.6, 0.8, d + 0.6, DGRAY);
    p.box(x, G + FLOOR * 2 + 0.8, z, w - 0.8, 1.6, d - 0.8, DGRAY);
    for (const row of [1.6, FLOOR + 1.6]) for (let t = -w / 2 + 1.2; t <= w / 2 - 1; t += 2.4) if (w > d) p.box(x + t, G + row, z + d / 2 + 0.1, 1.2, 3, 0.4, GLASS);
    for (const row of [1.6, FLOOR + 1.6]) for (let t = -d / 2 + 1.2; t <= d / 2 - 1; t += 2.4) if (d >= w) p.box(x + (x < 0 ? 1 : -1) * (w / 2 + 0.1), G + row, z + t, 0.4, 3, 1.2, GLASS);
  };
  wing(0, -11, 26, 5);
  wing(-11.5, 2, 5, 24);
  wing(11.5, 2, 5, 24);
  // the glass pyramid, plus three small ones and the fountains
  for (let i = 0; i < 9; i++) {
    const s = 12 - i * 1.3;
    p.box(0, G + 0.3 + i * 1.2, 1, s, 1.2, s, i === 0 ? "dark-azure" : i % 2 ? GLASS : "medium-azure", { solid: i === 0 });
  }
  p.box(0, G + 11.1, 1, 0.6, 0.8, 0.6, "chrome-silver");
  for (const [x, z] of [[-6.5, 8.2], [6.5, 8.2], [0, 9.6]]) {
    for (let i = 0; i < 3; i++) p.box(x, G + 0.3 + i * 0.8, z, 2.6 - i * 0.8, 0.8, 2.6 - i * 0.8, GLASS);
  }
  for (const x of [-8, 8]) p.cyl(x, G + 0.3, 5, 2.4, 0.5, GLASS);
  for (const [x, z, c] of [[4, 11.5, "bright-red"], [-3.5, 12, "dark-azure"], [-9, 10.5, "lime"], [9, 11, "bright-yellow"]]) visitor(p, x, z, 2, { torso: c, legs: "dark-blue", hair: "black" });
  lampPost(p, -13, 13);
  lampPost(p, 13, 13);
  sign(p, lot, G + 15, 1, 11, 14);
}

function buildCathedral(p, lot) {
  const stone = "light-bluish-gray";
  plate(p, 28, 28, "tan");
  const w = 22;
  const d = 22;
  p.push(0, -3, 0);
  // nave and transept, steep gabled roof, central spire
  p.box(0, G, 0, w, 15, d, stone, { solid: true, s: true });
  gableRoof(p, 0, G + 15, 0, w - 8, d, DGRAY, { ridge: "z", overhang: 0.2 });
  p.box(0, G + 15, 0, w, 0.8, d + 1, "white");
  // west front: two square towers, three portals, rose window
  for (const sx of [-1, 1]) {
    p.box(sx * 7.6, G, d / 2 - 0.5, 7, 25, 7, stone, { solid: true });
    p.box(sx * 7.6, G + 25, d / 2 - 0.5, 7.6, 0.8, 7.6, "white");
    for (const y of [17, 20.5]) p.box(sx * 7.6, G + y, d / 2 + 3.1, 2.4, 3, 0.4, "black");
    for (let k = 0; k < 4; k++) p.box(sx * 7.6, G + 26 + k * 0.8, d / 2 - 0.5, 6.8 - k * 1.6, 0.8, 6.8 - k * 1.6, stone);
  }
  p.box(0, G + 15.8, d / 2 + 0.2, w - 14.8, 1, 1.6, "white"); // gallery of kings
  for (let t = -3; t <= 3; t += 1.2) p.box(t, G + 14.2, d / 2 + 1.1, 0.5, 1.4, 0.3, "dark-tan");
  p.cyl(0, G + 10.6, d / 2 + 0.7, 3.4, 0.6, "dark-azure", { axis: "z" });
  p.cyl(0, G + 10.6, d / 2 + 1, 2.8, 0.5, "trans-red", { axis: "z" });
  p.cyl(0, G + 10.6, d / 2 + 1.3, 1.3, 0.5, "bright-yellow", { axis: "z" });
  for (const x of [-6.6, 0, 6.6]) {
    p.box(x, G, d / 2 + 1.2, 3.6, 6.4, 0.8, x === 0 ? "dark-tan" : "reddish-brown");
    p.box(x, G + 6.4, d / 2 + 1.5, 4.4, 0.6, 0.6, "white");
    p.box(x, G + 7, d / 2 + 1.5, 3, 0.7, 0.6, "white");
  }
  // flying buttresses on the flanks
  for (const sx of [-1, 1]) for (const z of [-6, -1, 4]) {
    p.box(sx * (w / 2 + 1.3), G, z, 1.4, 11, 1.4, stone);
    p.box(sx * (w / 2 - 0.4), G + 11, z, 2.8, 0.8, 0.8, stone);
    p.box(sx * (w / 2 - 1.2), G + 11.8, z, 1.6, 1, 0.8, stone);
  }
  // the spire
  p.cone(0, G + 23, -3, 2.4, 3, DGRAY, { seg: 6 });
  p.cone(0, G + 25.4, -3, 1.4, 10, DGRAY, { seg: 6 });
  p.cyl(0, G + 35.4, -3, 0.2, 2, "pearl-gold");
  p.pop();
  for (const [x, z] of [[-10, 12], [10, 12]]) roundTree(p, x, z, { size: 0.8 });
  visitor(p, 0, 12, 2, { torso: "bright-red", legs: "black", hat: "black" });
  visitor(p, 4, 11, 2, { torso: "white", legs: "dark-blue", hair: "reddish-brown" });
  lampPost(p, -4, 12.5, { height: 8 });
  lampPost(p, 4, 12.5, { height: 8 });
  sign(p, lot, G + 38, -3, 11, 14);
}

/* ---------------------------------------------------------------- Rome */

function buildColosseum(p, lot) {
  plate(p, 28, 28, "dark-tan");
  const R = 11.6;
  const N = 48;
  const tiers = [4.4, 4.4, 4.4];
  const ruin = (a) => a > 0.2 && a < 1.75; // the collapsed outer wall on one side
  const ring = (r, y, h, n, every, opts = {}) => {
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2;
      if (opts.skip?.(a)) continue;
      if (every && k % every) continue;
      p.box(Math.cos(a) * r, y, Math.sin(a) * r, opts.s ?? 1.7, h, opts.s ?? 1.7, opts.c ?? STONE, { solid: opts.solid });
    }
  };
  const mouth = (a) => Math.abs(a - Math.PI / 2) < 0.34; // entrance on the street side
  let y = G;
  tiers.forEach((th, i) => {
    ring(R - i * 0.4, y, th, N, 2, { skip: (a) => mouth(a) || (i > 0 && ruin(a)), solid: i === 0 });
    ring(R - i * 0.4, y + th - 0.6, 0.6, N, 0, { skip: (a) => mouth(a) || (i > 0 && ruin(a)), c: "white" });
    y += th;
  });
  ring(R - 1.2, y, 3, N, 0, { skip: (a) => ruin(a) || mouth(a), c: STONE });
  for (let k = 0; k < N; k += 3) {
    const a = (k / N) * Math.PI * 2;
    if (ruin(a) || mouth(a)) continue;
    p.box(Math.cos(a) * (R - 1.2), y + 1, Math.sin(a) * (R - 1.2) + 0.9, 0.9, 1.2, 0.3, "dark-tan");
  }
  // stepped seating bowl and the arena floor
  [[9.4, 1.2], [8.2, 2.6], [7.0, 4]].forEach(([r, h]) => ring(r, G + 0.3, h, 40, 0, { s: 1.4, c: "dark-tan" }));
  p.cyl(0, G + 0.3, 0, 5.8, 0.25, "tan");
  for (let k = 0; k < 6; k++) p.box(Math.cos(k) * 2.2, G + 0.5, Math.sin(k) * 2.2, 0.9, 0.5, 0.9, "dark-tan");
  for (const x of [-12.8, 12.8]) lampPost(p, x, 12.8, { height: 7 });
  visitor(p, -3, 13, 2, { torso: "bright-red", legs: "dark-bluish-gray", hat: "dark-red" });
  visitor(p, 3, 13.5, 2, { torso: "bright-yellow", legs: "black", hair: "black" });
  sign(p, lot, G + 19, 0, 12, 14.5);
}

function dome(p, x, y, z, r, h, color, layers = 8) {
  for (let i = 0; i < layers; i++) {
    const t = i / layers;
    p.cyl(x, y + h * t, z, Math.max(0.6, r * Math.cos(t * Math.PI * 0.46)), h / layers + 0.05, color);
  }
}

function buildPantheon(p, lot) {
  const big = lot.style === "basilica";
  plate(p, 28, 28, "tan");
  // rotunda behind a columned portico
  const R = big ? 9.4 : 8.6;
  const wallH = big ? 12 : 9;
  p.cyl(0, G, -4, R, wallH, big ? "white" : "dark-tan", { solid: true });
  p.cyl(0, G + wallH, -4, R + 0.4, 0.8, STONE);
  if (big) {
    p.cyl(0, G + wallH + 0.8, -4, R - 1.8, 3.2, "white");
    dome(p, 0, G + wallH + 4, -4, R - 1.8, 8, GRAY, 9);
    for (const a of [0, 1, 2, 3, 4, 5]) p.box(Math.cos((a * Math.PI) / 3) * 5.2, G + wallH + 4.4, -4 + Math.sin((a * Math.PI) / 3) * 5.2, 0.6, 4, 0.6, "white");
    p.cyl(0, G + wallH + 12, -4, 1.2, 2.4, "white");
    p.cyl(0, G + wallH + 14.4, -4, 0.3, 2.4, "pearl-gold");
    p.box(0, G + wallH + 15.8, -4, 1.6, 0.4, 0.4, "pearl-gold");
    // long facade with an attic and a central loggia
    p.box(0, G, 5, 24, 11, 4, "white", { solid: true });
    p.box(0, G + 11, 5, 25, 1, 4.6, STONE);
    balustrade(p, 0, G + 12, 5, 24, 4);
    for (const x of [-9, -5, 5, 9]) column(p, x, 7.4, 10.4, 0.8, "white");
    p.box(0, G + 7, 7.2, 7, 3.6, 0.5, "dark-tan");
    pediment(p, 0, G + 11, 7, 8, 2, "white");
    for (const x of [-7.2, -2.4, 2.4, 7.2]) p.box(x, G + 3, 7.2, 2, 3.4, 0.4, GLASS);
    // obelisk at the heart of the piazza
    p.box(0, G, 11, 2.4, 0.8, 2.4, "dark-tan");
    p.box(0, G + 0.8, 11, 1.2, 8, 1.2, "tan", { solid: true });
    p.cone(0, G + 8.8, 11, 0.9, 1.6, "tan", { seg: 4 });
  } else {
    dome(p, 0, G + wallH + 0.8, -4, R, 7, GRAY, 9);
    p.cyl(0, G + wallH + 7.8, -4, 1.4, 0.6, "black");
    p.cyl(0, G + wallH + 8.2, -4, 1.7, 0.3, "dark-tan");
    // portico: eight granite columns and a pediment
    for (let k = 0; k < 8; k++) column(p, -7.7 + k * 2.2, 6.4, 9.2, 0.85, "light-bluish-gray");
    p.box(0, G + 9.2, 5.4, 18.4, 1.4, 5.6, STONE);
    pediment(p, 0, G + 10.6, 5.4, 18, 5.2, STONE);
    p.box(0, G, 2.6, 17, 0.6, 3, "dark-tan");
    p.box(0, G, -0.4, 4.4, 7.4, 0.6, "dark-orange");
    // the fountain and obelisk in the piazza
    p.cyl(0, G, 11.5, 3.2, 0.9, "white", { solid: true });
    p.cyl(0, G + 0.9, 11.5, 2.5, 0.3, GLASS);
    p.box(0, G + 0.9, 11.5, 1.1, 5, 1.1, "tan");
    p.cone(0, G + 5.9, 11.5, 0.8, 1.4, "tan", { seg: 4 });
  }
  for (const x of [-12, 12]) lampPost(p, x, 12.5, { height: 8 });
  visitor(p, -6, 12.5, 2, { torso: "lime", legs: "dark-blue", hair: "reddish-brown" });
  visitor(p, 6, 13, 2, { torso: "orange", legs: "black", hat: "white" });
  sign(p, lot, G + (big ? 33 : 23), -4, 12, 15);
}

function buildTrevi(p, lot) {
  plate(p, 28, 28, "tan");
  // palace backdrop with a triumphal-arch centrepiece
  p.box(0, G, -10.5, 26, 13, 4, "white", { solid: true });
  p.box(0, G + 13, -10.5, 27, 1, 4.6, STONE);
  balustrade(p, 0, G + 14, -10.5, 26, 4);
  for (const x of [-9, 9]) for (let r = 0; r < 2; r++) p.box(x, G + 2.5 + r * 5.2, -8.3, 2, 3.2, 0.4, GLASS);
  for (const x of [-5.2, -1.8, 1.8, 5.2]) column(p, x, -7.6, 12.4, 0.9, "white");
  p.box(0, G + 11.6, -8, 13.2, 1.4, 3.4, "white");
  pediment(p, 0, G + 13, -8, 12, 3, "white");
  p.box(0, G + 2, -8.2, 6.4, 8.4, 0.5, "dark-tan"); // central niche
  p.box(0, G + 2.4, -7.4, 1.4, 4, 1.4, "white"); // Oceanus
  p.box(0, G + 6.4, -7.4, 0.9, 1.2, 0.9, "tan");
  // the rocky scene and the basin
  p.box(0, G, -5.4, 18, 1.8, 4, "light-bluish-gray", { solid: true });
  for (const [x, h] of [[-6, 2.4], [-2.4, 3], [3, 2.6], [6.6, 2]]) p.box(x, G + 1.8, -5.6, 2.8, h, 2.8, "dark-bluish-gray");
  p.box(0, G, 2.6, 23, 1.2, 12, "white", { solid: true });
  p.box(0, G + 1.2, 2.6, 21.4, 0.5, 10.4, GLASS);
  for (let i = 0; i < 3; i++) p.box(0, G, 8.4 + i * 1, 13 - i * 2.4, 0.5 + (2 - i) * 0.2, 1, "white");
  for (let k = 0; k < 6; k++) p.box(-6 + k * 2.4, G + 1.2, -2.8, 0.7, 0.2, 2, "trans-clear");
  for (const [x, z] of [[-4, 4], [3, 0], [6, 5]]) p.cyl(x, G + 1.4, z, 0.4, 0.3, "pearl-gold");
  for (const [x, z, c] of [[-4, 13, "bright-red"], [2, 13.4, "dark-azure"], [8, 12.6, "bright-yellow"], [-9, 12.5, "bright-pink"]]) visitor(p, x, z, 2, { torso: c, legs: "dark-blue", hair: "black" });
  lampPost(p, -13, 12);
  lampPost(p, 13, 12);
  sign(p, lot, G + 20, -9, 12, 15.2);
}

function buildForum(p, lot, rng) {
  plate(p, 28, 28, "dark-tan");
  for (let r = 0; r < 2; r++) {
    for (let k = 0; k < 6; k++) {
      const h = rng.pick([8, 8, 6.4, 3.2, 8, 4.4]);
      column(p, -10 + k * 4, -8 + r * 6, h, 0.85, k % 2 ? STONE : "white");
      if (h > 7 && k < 5 && r === 0) p.box(-8 + k * 4, G + h, -8, 4, 0.9, 1.6, "white");
    }
  }
  // a temple podium with three columns, a standing arch and fallen drums
  p.box(-6, G, 7, 13, 1.6, 8, STONE, { solid: true });
  for (let k = 0; k < 3; k++) column(p, -10 + k * 4, 7, 8.4, 0.8, "white");
  p.box(-6, G + 8.4, 7, 13, 1.1, 3, "white");
  triumphalArch(p, 8, 8, { w: 12, d: 6, h: 11 });
  for (const [x, z] of [[2, -1.5], [-4, 1], [9, -4]]) p.cyl(x, G + 0.8, z, 0.85, 1.6, STONE, { axis: "x", solid: true });
  for (const [x, z] of [[-12, 12], [12, -12], [12, 2]]) pineTree(p, x, z, { size: 0.85, leaf: "dark-green" });
  visitor(p, 0, 11, 2, { torso: "bright-yellow", legs: "dark-blue", hat: "white" });
  sign(p, lot, G + 14, -8, 11, 15);
}

/* ---------------------------------------------------------- Punta Cana */

function thatchRoof(p, x, y, z, w, d, layers = 4, color = "dark-tan") {
  for (let i = 0; i < layers; i++) {
    const s = 1 - i / (layers + 0.6);
    p.box(x, y + i * 1.2, z, w * s + 1.4, 1.2, d * s + 1.4, i % 2 ? "tan" : color);
  }
  p.box(x, y + layers * 1.2, z, 1.4, 0.8, 1.4, "reddish-brown");
}

function buildResort(p, lot, rng) {
  plate(p, 28, 28, "tan");
  const color = lot.color ?? "white";
  // two wings of balconied rooms around a lagoon pool
  for (const sx of [-1, 1]) {
    p.box(sx * 10.5, G, -2, 5, FLOOR * 3, 18, color, { solid: true });
    for (let f = 0; f < 3; f++) {
      const y = G + 1.6 + f * FLOOR;
      for (let t = -7; t <= 7; t += 3.2) {
        p.box(sx * 7.7, y, -2 + t, 0.4, 3.2, 1.6, GLASS);
        p.box(sx * 7.1, y - 0.6, -2 + t, 1.2, 0.3, 2, ["bright-yellow", "orange", "bright-pink"][f]);
      }
    }
    thatchRoof(p, sx * 10.5, G + FLOOR * 3, -2, 5, 18, 3);
  }
  p.box(0, G, -11, 26, FLOOR * 2, 4, color, { solid: true });
  for (let t = -10; t <= 10; t += 4) {
    p.box(t, G + 2, -8.9, 2, 3.4, 0.4, GLASS);
    p.box(t, G + FLOOR + 2, -8.9, 2, 3.4, 0.4, GLASS);
  }
  door(p, 0, G, -8.9, 4, 6, "dark-tan");
  thatchRoof(p, 0, G + FLOOR * 2, -11, 26, 4, 3);
  // pool, loungers and parasols
  p.box(0, G, 3, 12, 0.8, 12, "white");
  p.box(0, G + 0.8, 3, 10.4, 0.3, 10.4, "dark-azure");
  p.box(0, G + 1.1, 3, 10.4, 0.2, 10.4, GLASS);
  for (const [x, z] of [[-7, 9], [-4, 9.6], [4, 9.6], [7, 9]]) {
    p.box(x, G, z, 1.2, 0.7, 3, "white");
    p.box(x, G + 0.7, z - 1.2, 1.2, 0.6, 0.8, "bright-blue");
  }
  for (const [x, z] of [[-6, 11], [6, 11]]) {
    p.cyl(x, G, z, 0.2, 5, "white");
    p.cone(x, G + 4.4, z, 2.6, 1.4, rng.pick(["bright-red", "bright-yellow", "bright-pink"]), { seg: 10 });
  }
  for (const [x, z] of [[-12, 8], [12, 8], [-12, -6], [12, -12]]) palmTree(p, x, z, 12 + (x > 0 ? 1.5 : 0));
  visitor(p, 0, 11.5, 2, { torso: "bright-pink", legs: "bright-yellow", hat: "white" });
  sign(p, lot, G + FLOOR * 2 + 8, -11, 11, 14);
}

function buildPalapa(p, lot, rng) {
  plate(p, 28, 28, "tan");
  // round thatched bar: posts, counter, stools
  for (let k = 0; k < 10; k++) {
    const a = (k / 10) * Math.PI * 2;
    p.cyl(Math.cos(a) * 6.4, G, Math.sin(a) * 6.4 - 2, 0.55, 7, "reddish-brown", { solid: true });
  }
  p.cyl(0, G, -2, 5.2, 0.4, "reddish-brown");
  p.cyl(0, G + 0.4, -2, 2.6, 2.6, "bright-light-orange", { solid: true });
  p.cyl(0, G + 3, -2, 2.9, 0.5, "dark-tan");
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2 + 0.2;
    p.cyl(Math.cos(a) * 4.2, G, Math.sin(a) * 4.2 - 2, 0.6, 2, "bright-red");
  }
  p.cone(0, G + 7, -2, 9.4, 4, "dark-tan", { seg: 14 });
  p.cone(0, G + 9.8, -2, 6.2, 3.6, "tan", { seg: 14 });
  p.cone(0, G + 12.2, -2, 3, 3, "dark-tan", { seg: 14 });
  p.cyl(0, G + 14.8, -2, 0.3, 2, "reddish-brown");
  // hammocks, tiki torches, a beach volleyball net
  for (const sx of [-1, 1]) {
    p.cyl(sx * 11, G, 6, 0.3, 5, "reddish-brown");
    p.cyl(sx * 11, G + 5, 6, 0.4, 0.4, "orange", { emissive: true });
  }
  p.box(0, G + 2.4, 7, 9, 0.5, 2, "bright-yellow");
  p.cyl(-4.5, G, 7, 0.3, 4.5, "reddish-brown");
  p.cyl(4.5, G, 7, 0.3, 4.5, "reddish-brown");
  p.box(0, G + 3.4, 11, 8, 1.2, 0.2, "white");
  p.cyl(-4, G, 11, 0.25, 4.4, "white");
  p.cyl(4, G, 11, 0.25, 4.4, "white");
  p.cyl(0, G + 0.3, 12.8, 0.6, 0.6, "white");
  for (const [x, z] of [[-11, -10], [11, -10], [-12, 3], [12, 11]]) palmTree(p, x, z, 11 + rng.range(0, 3));
  visitor(p, -3, 8, 1, { torso: "bright-yellow", legs: "bright-blue", hat: "orange" });
  visitor(p, 3, 9, 3, { torso: "lime", legs: "black", hair: "black" });
  sign(p, lot, G + 18, -2, 11, 14);
}

function buildPier(p, lot, rng) {
  plate(p, 28, 28, "tan");
  // a wooden pier running toward the sea on the east, with a catamaran at its end
  p.box(2, G + 0.3, 0, 26, 0.6, 4, "reddish-brown", { top: true });
  for (let x = -9; x <= 14; x += 3) for (const z of [-1.7, 1.7]) p.cyl(x, G - 1.2, z, 0.35, 2.6, "dark-tan");
  for (let x = -9; x <= 14; x += 1.5) p.box(x, G + 0.9, 0, 0.9, 0.2, 4.2, "dark-tan");
  for (const x of [-9, 14]) for (const z of [-2.2, 2.2]) p.box(x, G + 0.9, z, 0.4, 1.4, 0.4, "black");
  p.box(15, G - 0.2, 5.4, 12, 1.4, 1.4, "white");
  p.box(15, G - 0.2, 9.4, 12, 1.4, 1.4, "white");
  p.box(15, G + 0.4, 7.4, 8, 0.4, 8.4, "dark-tan");
  p.box(15, G + 0.8, 7.4, 0.5, 11, 0.5, "white");
  p.box(15.6, G + 2.6, 7.4, 0.3, 8, 4.6, "bright-red");
  // beach: loungers, umbrellas, a lifeguard tower
  for (const [x, z] of [[-8, 8], [-4, 9], [0, 8.4], [-9, -8]]) {
    p.box(x, G, z, 1.2, 0.6, 3, "white");
    p.box(x, G + 0.6, z - 1.2, 1.2, 0.5, 0.8, "bright-yellow");
  }
  p.cyl(-6, G, 11, 0.2, 5, "white");
  p.cone(-6, G + 4.4, 11, 2.8, 1.4, "bright-blue", { seg: 10 });
  p.box(-10, G, -9, 3.4, 4, 3.4, "bright-red", { solid: true });
  p.box(-10, G + 4, -9, 4.4, 0.6, 4.4, "white");
  p.box(-10, G + 2, -7.2, 1.6, 1.6, 0.3, GLASS);
  for (const [x, z] of [[-12, 12], [-3, -11], [-12, 0]]) palmTree(p, x, z, 12 + rng.range(0, 2));
  visitor(p, 0, 4, 1, { torso: "dark-azure", legs: "bright-yellow", hat: "white" });
  sign(p, lot, G + 8, 0, 11, 14);
}

function buildLighthouse(p, lot, rng) {
  plate(p, 28, 28, "tan");
  p.cyl(0, G, -2, 5, 1.2, "dark-bluish-gray", { solid: true });
  const bands = ["white", "bright-red", "white", "bright-red", "white"];
  bands.forEach((c, i) => p.cyl(0, G + 1.2 + i * 4, -2, 4.2 - i * 0.35, 4, c, { solid: i === 0 }));
  p.cyl(0, G + 21.2, -2, 3, 0.8, DGRAY);
  p.cyl(0, G + 22, -2, 2.2, 3, "trans-yellow", { emissive: true });
  p.cone(0, G + 25, -2, 3, 3, "bright-red", { seg: 12 });
  p.cyl(0, G + 28, -2, 0.3, 1.4, DGRAY);
  p.light("accent", 0, G + 23.4, -2, { c: "trans-yellow", size: 3 });
  door(p, 0, G + 1.2, 2.2, 2.4, 4, "reddish-brown");
  for (const [x, z] of [[-9, 6], [9, 7], [-11, -8], [11, -9]]) palmTree(p, x, z, 11 + rng.range(0, 3));
  p.box(-8, G, 8, 4, 1.4, 4, "dark-bluish-gray", { solid: true });
  visitor(p, 0, 8, 2, { torso: "white", legs: "dark-blue", hat: "bright-red" });
  sign(p, lot, G + 31, -2, 11, 14);
}

function buildThatchAirport(p, lot) {
  plate(p, 28, 28, "tan");
  p.box(0, G, 4, 28, 0.3, 20, DGRAY, { top: true });
  p.box(0, G + 0.3, 4, 26, 0.05, 0.4, "bright-yellow");
  // open-air terminal: three palm-thatched pavilions on posts
  for (const [x, w] of [[-8.6, 9], [0, 10], [8.6, 9]]) {
    for (const px of [-1, 1]) for (const pz of [-1, 1]) p.cyl(x + px * (w / 2 - 0.8), G, -9 + pz * 3.4, 0.55, 6.4, "reddish-brown", { solid: true });
    p.box(x, G, -9.4, w - 2, 5, 0.6, "white");
    for (let t = -w / 2 + 1.6; t <= w / 2 - 1.2; t += 2.4) p.box(x + t, G + 1.6, -9, 1.2, 2, 0.4, GLASS);
    thatchRoof(p, x, G + 6.4, -9, w + 1.6, 9, 4);
  }
  p.box(0, G + 6.4, -9, 5, 1.2, 9, "reddish-brown");
  jet(p, -1, 7, "bright-blue");
  p.box(0, G + 4, -2, 3, 0.4, 2, GRAY);
  p.push(10, 12, 1);
  minifig(p, { torso: "orange", legs: "black", hat: "white" });
  p.pop();
  for (const [x, z] of [[-12, 12], [12, 12], [-12, -12], [12, -12]]) palmTree(p, x, z, 12);
  lampPost(p, -6, 13);
  lampPost(p, 6, 13);
  sign(p, lot, G + 16, -9, 12, 14);
}

/* --------------------------------------------------------------- water */

/** Water inside a block: a river segment (quays stay walkable) or open sea. */
function buildWater(p, lot, rng) {
  const sea = lot.kind === "sea";
  const half = sea ? 16 : 12.4;
  p.box(0, G, 0, half * 2, 0.7, half * 2, "dark-azure");
  p.box(0, G + 0.7, 0, half * 2, 0.3, half * 2, GLASS);
  p.blocker(0, 0, half * 2 - 1, half * 2 - 1);
  // ripples
  for (let i = 0; i < (sea ? 14 : 8); i++) {
    const x = rng.range(-half + 2, half - 2);
    const z = rng.range(-half + 2, half - 2);
    p.box(x, G + 1.05, z, rng.range(2, 3.6), 0.1, 0.5, "trans-clear");
  }
  if (sea) {
    // sailboats and buoys far from the beach
    for (const [x, z] of [[-4, -8], [6, 7]]) {
      p.box(x, G + 1, z, 5, 1.2, 2, "white");
      p.box(x + 0.6, G + 2.2, z, 0.4, 7, 0.4, "white");
      p.box(x + 0.8, G + 3, z, 0.2, 5, 3.2, "bright-red");
    }
    for (const [x, z] of [[8, -4], [-10, 2], [2, 12]]) p.cyl(x, G + 1, z, 0.6, 1, "bright-yellow");
  } else if (lot.boat) {
    // a river cruise boat
    p.box(0, G + 1, 0, 14, 1.4, 4.2, "white");
    p.box(0, G + 2.4, 0, 9, 1.6, 3.4, GLASS);
    p.box(0, G + 4, 0, 9.6, 0.4, 3.8, "bright-blue");
  }
  void lot;
}

registerBuilders(
  {
    gate: buildGate,
    palace: buildPalace,
    arcade: buildArcade,
    cibeles: buildCibeles,
    stadium: buildStadium,
    eiffel: buildEiffel,
    arc: buildArc,
    pyramid: buildPyramid,
    cathedral: buildCathedral,
    colosseum: buildColosseum,
    pantheon: buildPantheon,
    trevi: buildTrevi,
    forum: buildForum,
    resort: buildResort,
    palapa: buildPalapa,
    pier: buildPier,
    lighthouse: buildLighthouse,
    thatchairport: buildThatchAirport,
    river: buildWater,
    sea: buildWater,
  },
  {
    gate: "dark-tan",
    palace: "dark-tan",
    arcade: "dark-tan",
    cibeles: "tan",
    stadium: DGRAY,
    eiffel: "bright-green",
    arc: DGRAY,
    pyramid: "white",
    cathedral: "tan",
    colosseum: "dark-tan",
    pantheon: "tan",
    trevi: "tan",
    forum: "dark-tan",
    resort: "tan",
    palapa: "tan",
    pier: "tan",
    lighthouse: "tan",
    thatchairport: "tan",
    river: "dark-azure",
    sea: "dark-azure",
  },
);

export const WORLD_KINDS = ["gate", "palace", "arcade", "cibeles", "stadium", "eiffel", "arc", "pyramid", "cathedral", "colosseum", "pantheon", "trevi", "forum", "resort", "palapa", "pier", "lighthouse", "thatchairport", "river", "sea"];
