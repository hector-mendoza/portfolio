/**
 * Lot builders. Everything is expressed in a local frame whose origin is the
 * lot centre and whose +z side is the "front" (the road the tram passes).
 * Builders only emit primitives through `Parts`, so the same code feeds the
 * Three.js runtime and (via city-parts.json) the Blender exporter.
 */
import { BRICK, PLATE, FLOOR, GROUND, createRng } from "./layout.js";
import { textCells, textWidth, GLYPH_H } from "./font.js";

const G = GROUND;
const GRAY = "light-bluish-gray";
const DGRAY = "dark-bluish-gray";

/* ------------------------------------------------------------------ props */

/**
 * A LEGO-style gable roof: each course is a flat row of bricks with a 45°
 * slope brick on both outer edges, every course one stud narrower.
 * `ridge` is the axis the ridge runs along ('x' = slopes face n/s).
 */
export function gableRoof(p, x, y, z, w, d, color, { ridge = "z", overhang = 1 } = {}) {
  const span = (ridge === "z" ? w : d) + overhang;
  const length = (ridge === "z" ? d : w) + overhang;
  let k = 0;
  let top = y;
  for (let width = span; width > 2.4; width -= 2 * BRICK) {
    const half = width / 2;
    const inner = width - 2 * BRICK;
    const cy = y + k * BRICK;
    if (ridge === "z") {
      if (inner > 0.01) p.box(x, cy, z, inner, BRICK, length, color);
      p.wedge(x - half + BRICK / 2, cy, z, BRICK, BRICK, length, "w", color);
      p.wedge(x + half - BRICK / 2, cy, z, BRICK, BRICK, length, "e", color);
    } else {
      if (inner > 0.01) p.box(x, cy, z, length, BRICK, inner, color);
      p.wedge(x, cy, z - half + BRICK / 2, length, BRICK, BRICK, "n", color);
      p.wedge(x, cy, z + half - BRICK / 2, length, BRICK, BRICK, "s", color);
    }
    k += 1;
    top = cy + BRICK;
  }
  // ridge cap
  if (ridge === "z") p.box(x, top, z, 2.4, 0.4, length, color);
  else p.box(x, top, z, length, 0.4, 2.4, color);
  return top + 0.4;
}

export function mosaicSign(p, lines, x, y, z, { color = "bright-red", bg = "white", cell = 1, depth = 1, frame = true } = {}) {
  const rows = lines.length;
  const width = Math.max(...lines.map(textWidth)) * cell;
  const height = rows * GLYPH_H * BRICK + (rows - 1) * BRICK;
  if (frame) p.box(x, y, z - depth / 2 - 0.1, width + 2 * cell, height + 2 * BRICK, depth, bg);
  let rowTop = y + height;
  for (const line of lines) {
    const lineWidth = textWidth(line) * cell;
    const left = x - lineWidth / 2;
    for (const [c, r] of textCells(line)) {
      p.box(left + (c + 0.5) * cell, rowTop - (r + 1) * BRICK, z, cell, BRICK, depth, color, { emissive: true });
    }
    rowTop -= (GLYPH_H + 1) * BRICK;
  }
  p.light("accent", x, y + height / 2, z + 1.5, { c: color, size: Math.max(1, width / 14) });
  return { width, height };
}

/**
 * A brick-built oak in the style of a LEGO MOC tree: flared roots, a
 * segmented trunk, brown branches radiating from a crown, and a cloud of
 * small 2x2 leaf plates hung on the branch tips at several heights.
 */
/**
 * A brick-built oak in the style of a LEGO MOC tree: flared roots, a tall
 * segmented trunk, brown branches radiating from a crown at several
 * heights, and a dense canopy of small leaf plates hung on the branches.
 */
export function roundTree(p, x, z, { trunk = 2.4, leaf = "bright-green", size = 1, base = G, solid = true } = {}) {
  const rng = createRng(Math.round(x * 131 + z * 17 + size * 1000) | 1);
  const brown = "reddish-brown";
  const leaves = [leaf, leaf, leaf, leaf === "bright-green" ? "green" : leaf, "lime"];
  const trunkH = (trunk + 10) * size;
  // roots
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2 + 0.4;
    p.box(x + Math.cos(a) * 1.1 * size, base, z + Math.sin(a) * 1.1 * size, 1.4 * size, 0.5, 1.4 * size, brown);
  }
  // trunk: stacked 2x2 bricks with a slight taper
  p.box(x, base, z, 1.8 * size, trunkH * 0.55, 1.8 * size, brown, { solid });
  p.box(x, base + trunkH * 0.55, z, 1.4 * size, trunkH * 0.45, 1.4 * size, brown);
  // three tiers of branches, each tier wider than the one above
  const tiers = [
    { y: trunkH * 0.55, len: 5.2, n: 6, lift: 1.0 },
    { y: trunkH * 0.78, len: 4.4, n: 5, lift: 1.1 },
    { y: trunkH, len: 3.0, n: 4, lift: 1.0 },
  ];
  tiers.forEach((tier, ti) => {
    const crownY = base + tier.y;
    for (let k = 0; k < tier.n; k++) {
      const a = (k / tier.n) * Math.PI * 2 + ti * 0.6 + rng.range(-0.3, 0.3);
      const len = tier.len * size * rng.range(0.85, 1.15);
      const lift = tier.lift * size;
      const bx = x + Math.cos(a) * len * 0.5;
      const bz = z + Math.sin(a) * len * 0.5;
      const alongX = Math.abs(Math.cos(a)) > Math.abs(Math.sin(a));
      p.box(bx, crownY + lift * 0.5, bz, alongX ? len : 0.6 * size, 0.5 * size, alongX ? 0.6 * size : len, brown);
      // leaf plates along the outer half of the branch, piled two deep
      for (const t of [1, 0.7]) {
        const lx = x + Math.cos(a) * len * t;
        const lz = z + Math.sin(a) * len * t;
        const n = t === 1 ? 5 : 3;
        for (let j = 0; j < n; j++) {
          const ox = rng.range(-1.1, 1.1) * size;
          const oz = rng.range(-1.1, 1.1) * size;
          const oy = rng.range(-0.3, 1.5) * size;
          p.box(lx + ox, crownY + lift + oy, lz + oz, 1.6 * size, 0.4, 1.6 * size, rng.pick(leaves));
        }
      }
    }
  });
  // top tuft
  const top = base + trunkH;
  for (let j = 0; j < 9; j++) {
    p.box(x + rng.range(-1.8, 1.8) * size, top + (0.8 + rng.range(0, 3)) * size, z + rng.range(-1.4, 1.4) * size, 1.6 * size, 0.4, 1.6 * size, rng.pick(leaves));
  }
}

export function pineTree(p, x, z, { size = 1, leaf = "green" } = {}) {
  p.cyl(x, G, z, 0.7 * size, 4 * size, "reddish-brown", { solid: true });
  let y = G + 3 * size;
  for (const r of [3.6, 3.0, 2.4, 1.7, 1.0].map((r) => r * size)) {
    p.cone(x, y, z, r, 3.6 * size, leaf, { seg: 12 });
    y += 2.4 * size;
  }
}

export function palmTree(p, x, z, height = 14) {
  for (let i = 0; i < height; i += 1.2) {
    p.cyl(x + Math.sin(i * 0.9) * 0.15, G + i, z, 0.55, 1.2, "reddish-brown", { solid: i === 0 });
  }
  const top = G + height;
  p.box(x, top, z, 7, 0.4, 1.6, "bright-green");
  p.box(x, top + 0.2, z, 1.6, 0.4, 7, "bright-green");
  p.cone(x, top + 0.4, z, 1.2, 1.2, "bright-green", { seg: 8 });
}

export function lampPost(p, x, z, { height = 10 } = {}) {
  p.cyl(x, G, z, 0.35, height, "black", { solid: true });
  p.box(x, G + height, z, 1.4, 0.8, 1.4, "trans-yellow", { emissive: true });
  p.box(x, G + height + 0.8, z, 1.8, 0.3, 1.8, "black");
  p.light("lamp", x, G + height + 0.2, z);
}

export function bench(p, x, z, rot = 0) {
  p.push(x, z, rot);
  p.box(0, G, 0, 4, 1.2, 0.6, DGRAY, { solid: true });
  p.box(0, G + 1.2, 0, 4, 0.4, 1.6, "reddish-brown");
  p.box(0, G + 1.6, -0.6, 4, 1.4, 0.4, "reddish-brown");
  p.pop();
}

export function flowerBed(p, x, z, w, d, rng) {
  p.box(x, G, z, w, PLATE, d, "green");
  const colors = ["bright-pink", "bright-yellow", "white", "orange"];
  for (let i = 0; i < Math.floor((w * d) / 3); i++) {
    const fx = x + rng.range(-w / 2 + 0.6, w / 2 - 0.6);
    const fz = z + rng.range(-d / 2 + 0.6, d / 2 - 0.6);
    p.cyl(fx, G + PLATE, fz, 0.35, 0.6, "green");
    p.cyl(fx, G + PLATE + 0.6, fz, 0.5, 0.3, rng.pick(colors));
  }
}

export function fence(p, x, z, length, rot = 0, color = "white") {
  p.push(x, z, rot);
  const posts = Math.floor(length / 2);
  for (let i = 0; i <= posts; i++) {
    p.box(-length / 2 + i * 2, G, 0, 0.4, 1.6, 0.4, color);
  }
  p.box(0, G + 0.6, 0, length, 0.3, 0.3, color);
  p.box(0, G + 1.2, 0, length, 0.3, 0.3, color);
  p.pop();
  p.push(x, z, rot);
  p.blocker(0, 0, length, 0.6);
  p.pop();
}

/* --------------------------------------------------------------- vehicles */

/** A LEGO City car, 4 studs wide, pointing toward local -z (forward). */
export function car(p, x, z, rot = 0, { color = "bright-red", kind = "car" } = {}) {
  p.push(x, z, rot);
  const long = kind === "van" ? 9 : 7;
  const wheelY = G + 0.8;
  for (const [wx, wz] of [[-1.7, -2.2], [1.7, -2.2], [-1.7, 2.2], [1.7, 2.2]]) {
    p.cyl(wx, wheelY, wz, 0.85, 0.8, "black", { axis: "x" });
    p.cyl(wx, wheelY + 0.3, wz, 0.4, 0.9, GRAY, { axis: "x" });
  }
  p.box(0, G + 0.8, 0, 4, 1.2, long, color, { solid: true });
  if (kind === "van") {
    p.box(0, G + 2, 0.5, 4, 2.6, long - 2, color);
    p.box(0, G + 2, -3.2, 3.6, 1.6, 2, "trans-light-blue");
    p.box(0, G + 4.6, 0.5, 4, 0.3, long - 2, "white");
  } else {
    p.box(0, G + 2, 0.4, 3.6, 1.6, 3.6, "trans-light-blue");
    p.box(0, G + 3.6, 0.4, 3.6, 0.3, 3.6, color);
    p.box(0, G + 2, -2.6, 4, 0.4, 1.6, color);
  }
  p.box(-1.3, G + 1.2, -long / 2 - 0.1, 0.8, 0.5, 0.3, "trans-yellow", { emissive: true });
  p.box(1.3, G + 1.2, -long / 2 - 0.1, 0.8, 0.5, 0.3, "trans-yellow", { emissive: true });
  p.box(-1.3, G + 1.2, long / 2 + 0.1, 0.8, 0.5, 0.3, "trans-red", { emissive: true });
  p.box(1.3, G + 1.2, long / 2 + 0.1, 0.8, 0.5, 0.3, "trans-red", { emissive: true });
  p.pop();
}

/** The city tram. Forward is local -z. 6 studs wide, 22 long. */
export function tram(p, { color = "bright-red", trim = "white" } = {}) {
  const long = 22;
  for (const bz of [-7, 7]) {
    p.box(0, G + 0.3, bz, 5, 1, 5, DGRAY);
    for (const wx of [-2.2, 2.2]) {
      p.cyl(wx, G + 0.6, bz - 1.6, 0.8, 0.6, "black", { axis: "x" });
      p.cyl(wx, G + 0.6, bz + 1.6, 0.8, 0.6, "black", { axis: "x" });
    }
  }
  p.box(0, G + 1.3, 0, 6, 0.6, long, trim);
  p.box(0, G + 1.9, 0, 6, 2, long, color);
  p.box(0, G + 3.9, 0, 6.2, 2, long + 0.2, "trans-light-blue");
  for (let z = -9; z <= 9; z += 3) {
    p.box(-3.05, G + 3.9, z, 0.3, 2, 0.5, color);
    p.box(3.05, G + 3.9, z, 0.3, 2, 0.5, color);
  }
  p.box(0, G + 5.9, 0, 6, 0.6, long, trim);
  p.box(0, G + 6.5, 0, 5, 0.4, long - 2, GRAY);
  p.box(0, G + 6.9, 0, 0.6, 2.4, 0.6, DGRAY);
  p.box(0, G + 9.3, 0, 3, 0.3, 0.5, DGRAY);
  p.box(0, G + 1.9, -long / 2 - 0.2, 5, 1.4, 0.4, "black");
  p.box(-2, G + 3.4, -long / 2 - 0.2, 1.2, 0.5, 0.3, "trans-yellow", { emissive: true });
  p.box(2, G + 3.4, -long / 2 - 0.2, 1.2, 0.5, 0.3, "trans-yellow", { emissive: true });
  p.box(-2, G + 3.4, long / 2 + 0.2, 1.2, 0.5, 0.3, "trans-red", { emissive: true });
  p.box(2, G + 3.4, long / 2 + 0.2, 1.2, 0.5, 0.3, "trans-red", { emissive: true });
}

/* --------------------------------------------------------------- minifig */

export const MINIFIG_HEIGHT = 5.5;

const LIGHT = new Set(["white", "bright-yellow", "tan", "lime", "bright-light-orange", "sand-green", "bright-pink", "lavender"]);
/** A readable print colour for a torso colour (buttons, stripes, ties). */
const contrast = (c) => (LIGHT.has(c) ? "dark-blue" : "white");

/**
 * Minifigure in local frame, feet at y=0, facing -z, built to LEGO proportions
 * (1 stud = 8 mm): printed face, hair or hat piece, neck, tapered torso with a
 * print and a belt, C-clip hands, hip slit, and shoe-printed legs. Parts are
 * tagged so the runtime can swing limbs. Total height ≈ 5.5 studs.
 *
 * Options: torso, legs, skin, hair, hairStyle (short|long|ponytail|messy|bald),
 * hat + hatStyle (cap|hard|top|beanie), face (smile|grin|wink|surprised|glasses),
 * print (plain|buttons|tie|stripes|jacket), shoes, belt, accessory (backpack|scarf|none).
 */
export function minifig(
  p,
  {
    torso = "bright-blue",
    legs = "dark-blue",
    hair = "reddish-brown",
    skin = "bright-yellow",
    hat = null,
    hatStyle = "cap",
    hairStyle = "short",
    face = "smile",
    print = "plain",
    shoes = "black",
    belt = "black",
    accessory = "none",
  } = {},
) {
  const ink = "black";
  const tone = contrast(torso);

  // legs: a shoe print at the bottom, a slightly longer toe, and the hip piece with its slit
  for (const [side, part] of [[-1, "leftLeg"], [1, "rightLeg"]]) {
    p.box(side * 0.5, 0.35, 0, 0.97, 1.15, 0.97, legs, { part });
    p.box(side * 0.5, 0, -0.06, 1.0, 0.35, 1.1, shoes, { part });
    p.box(side * 0.5, 0.35, -0.49, 0.96, 0.05, 0.03, shoes, { part });
  }
  p.box(0, 1.5, 0, 2.0, 0.45, 1.02, legs, { part: "hips" });
  p.box(0, 1.5, -0.52, 0.05, 0.45, 0.02, ink, { part: "hips" });

  // torso: slightly tapered, wider at the shoulders
  p.box(0, 1.95, 0, 2.0, 0.75, 1.0, torso, { part: "torso" });
  p.box(0, 2.7, 0, 2.2, 0.85, 1.0, torso, { part: "torso" });
  if (belt) {
    p.box(0, 1.95, 0, 2.02, 0.2, 1.02, belt, { part: "torso" });
    p.box(0, 1.97, -0.52, 0.34, 0.16, 0.03, "pearl-gold", { part: "torso" });
  }
  // torso print on the front (-z) face
  const fz = -0.52;
  const strip = (x, y, w, h, c) => p.box(x, y, fz, w, h, 0.03, c, { part: "torso" });
  if (print === "buttons") {
    for (const y of [2.35, 2.75, 3.15]) strip(0, y, 0.16, 0.16, tone);
    strip(0, 3.4, 0.7, 0.12, skin);
  } else if (print === "tie") {
    strip(-0.3, 3.2, 0.34, 0.3, "white");
    strip(0.3, 3.2, 0.34, 0.3, "white");
    strip(0, 3.25, 0.26, 0.24, "bright-red");
    strip(0, 2.25, 0.3, 1.0, "bright-red");
    strip(0, 2.15, 0.2, 0.1, "bright-red");
  } else if (print === "stripes") {
    for (const y of [2.15, 2.65, 3.15]) strip(0, y, 2.2, 0.22, tone);
  } else if (print === "jacket") {
    strip(0, 2.1, 0.08, 1.35, ink);
    strip(-0.75, 2.4, 0.5, 0.4, ink);
    strip(0.75, 2.4, 0.5, 0.4, ink);
    strip(0, 3.4, 0.5, 0.12, skin);
  } else {
    strip(0, 3.42, 0.55, 0.1, skin);
  }
  // back print: a quiet stripe so the figure reads from behind too
  p.box(0, 3.0, 0.52, 1.6, 0.14, 0.03, contrast(torso), { part: "torso" });

  // neck and head, with the classic hollow stud on top
  p.cyl(0, 3.55, 0, 0.45, 0.25, skin, { part: "head" });
  p.cyl(0, 3.7, 0, 1.0, 1.25, skin, { part: "head" });
  p.cyl(0, 4.95, 0, 0.38, 0.22, skin, { part: "head" });

  // arms with sleeves, and C-clip hands
  for (const [side, part] of [[-1, "leftArm"], [1, "rightArm"]]) {
    p.box(side * 1.4, 2.2, 0, 0.6, 1.35, 0.62, torso, { part });
    p.box(side * 1.4, 2.2, 0, 0.62, 0.1, 0.64, contrast(torso), { part });
    p.cyl(side * 1.4, 1.65, 0, 0.36, 0.55, skin, { part });
    p.box(side * 1.4, 1.7, -0.28, 0.22, 0.4, 0.1, ink, { part }); // the clip's opening
  }

  // face print: each mark sits on the curved front of the head, half proud of the surface
  const skinZ = (x) => -Math.sqrt(Math.max(0.05, 1 - x * x));
  const mark = (x, y, w, h, c = ink) => p.box(x, y, skinZ(x) - 0.01, w, h, 0.09, c, { part: "head" });
  const dot = (x, y, r, c = ink) => p.cyl(x, y, skinZ(x), r, 0.1, c, { axis: "z", seg: 12, part: "head" });
  const eyeY = 4.4;
  const eye = (x, tall = 0.06) => {
    dot(x, eyeY + tall, 0.1);
    dot(x, eyeY - tall, 0.1);
  };
  const brow = (x, lift = 0) => mark(x, 4.82 + lift, 0.42, 0.07);
  if (face === "wink") {
    eye(-0.33);
    for (const dx of [-0.12, 0, 0.12]) dot(0.33 + dx, eyeY + 0.02 + (dx === 0 ? -0.04 : 0), 0.06);
  } else if (face === "surprised") {
    eye(-0.33, 0.11);
    eye(0.33, 0.11);
  } else {
    eye(-0.33);
    eye(0.33);
  }
  brow(-0.33, face === "surprised" ? 0.1 : 0);
  brow(0.33, face === "surprised" ? 0.1 : 0);
  if (face === "surprised") {
    dot(0, 4.02, 0.16, "dark-red");
  } else {
    const grin = face === "grin";
    const half = grin ? 0.52 : 0.44;
    if (grin) mark(0, 4.1, 0.78, 0.13, "white");
    for (let i = 0; i < 9; i++) {
      const x = -half + (i * half * 2) / 8;
      dot(x, 4.04 + (grin ? 0.2 : 0.15) * (x / half) * (x / half), grin ? 0.085 : 0.08);
    }
  }
  if (face === "glasses") {
    for (const x of [-0.36, 0.36]) {
      mark(x, 4.25, 0.56, 0.06);
      mark(x, 4.67, 0.56, 0.06);
      mark(x - 0.28, 4.46, 0.06, 0.48);
      mark(x + 0.28, 4.46, 0.06, 0.48);
    }
    mark(0, 4.58, 0.2, 0.06);
  }

  // hair (or a hat over the back of it)
  const headTop = 4.95;
  if (hat) {
    const brimTo = hatStyle === "cap" ? -1.35 : null;
    if (hatStyle === "top") {
      p.cyl(0, headTop - 0.2, 0, 1.3, 0.2, hat, { part: "head" });
      p.cyl(0, headTop, 0, 0.9, 1.1, hat, { part: "head" });
      p.cyl(0, headTop + 0.35, 0, 0.93, 0.2, contrast(hat), { part: "head" });
    } else if (hatStyle === "hard") {
      p.cyl(0, headTop - 0.35, 0, 1.12, 0.55, hat, { part: "head" });
      p.cyl(0, headTop + 0.2, 0, 0.9, 0.35, hat, { part: "head" });
      p.box(0, headTop + 0.35, 0, 0.5, 0.15, 1.9, hat, { part: "head" });
      p.box(0, headTop - 0.35, -1.2, 1.7, 0.1, 0.4, hat, { part: "head" });
    } else if (hatStyle === "beanie") {
      p.cyl(0, headTop - 0.4, 0, 1.1, 0.6, hat, { part: "head" });
      p.cyl(0, headTop + 0.2, 0, 0.85, 0.35, hat, { part: "head" });
      p.cyl(0, headTop + 0.55, 0, 0.28, 0.28, contrast(hat), { part: "head" });
    } else {
      p.cyl(0, headTop - 0.35, 0, 1.08, 0.65, hat, { part: "head" });
      p.cyl(0, headTop + 0.3, 0, 0.8, 0.25, hat, { part: "head" });
      p.cyl(0, headTop + 0.55, 0, 0.3, 0.2, hat, { part: "head" });
      p.box(0, headTop - 0.4, brimTo, 1.7, 0.12, 0.7, hat, { part: "head" }); // the peak
    }
    if (hairStyle === "long" || hairStyle === "ponytail") p.box(0, 3.5, 0.62, 2.0, 1.2, 0.5, hair, { part: "head" });
  } else if (hairStyle !== "bald") {
    p.cyl(0, headTop - 0.28, 0, 1.06, 0.62, hair, { part: "head" });
    p.cyl(0, headTop + 0.28, 0, 0.9, 0.28, hair, { part: "head" });
    p.cyl(0, headTop + 0.55, 0, 0.38, 0.22, hair, { part: "head" });
    p.box(0, 4.25, 0.5, 2.1, 0.85, 0.55, hair, { part: "head" });
    for (const x of [-1, 1]) p.box(x * 0.98, 4.35, 0.15, 0.2, 0.75, 1.0, hair, { part: "head" });
    p.box(-0.35, headTop - 0.28, -0.92, 1.3, 0.3, 0.2, hair, { part: "head" }); // the fringe
    p.box(0.55, headTop - 0.22, -0.9, 0.8, 0.22, 0.2, hair, { part: "head" });
    if (hairStyle === "long") {
      p.box(0, 3.4, 0.55, 2.1, 1.0, 0.5, hair, { part: "head" });
      for (const x of [-1, 1]) p.box(x * 1.02, 3.55, 0.1, 0.18, 1.0, 0.9, hair, { part: "head" });
    } else if (hairStyle === "ponytail") {
      p.box(0, 4.2, 0.9, 0.55, 0.32, 0.55, "bright-red", { part: "head" });
      p.box(0, 3.4, 1.05, 0.55, 0.9, 0.5, hair, { part: "head" });
    } else if (hairStyle === "messy") {
      for (const [x, z, h] of [[-0.5, -0.2, 0.35], [0.3, 0.3, 0.4], [0.55, -0.35, 0.3], [-0.2, 0.55, 0.35]]) p.box(x, headTop + 0.4, z, 0.4, h, 0.4, hair, { part: "head" });
    }
  }

  // accessories
  if (accessory === "backpack") {
    p.box(0, 2.0, 0.78, 1.6, 1.5, 0.55, "dark-red");
    p.box(0, 2.1, 1.08, 1.3, 0.6, 0.1, "bright-red");
    for (const x of [-0.75, 0.75]) p.box(x, 2.1, 0.5, 0.18, 1.3, 0.05, "dark-red");
  } else if (accessory === "scarf") {
    p.box(0, 3.3, 0, 2.3, 0.3, 1.1, "bright-red", { part: "torso" });
    p.box(-0.6, 2.5, -0.55, 0.4, 0.9, 0.08, "bright-red", { part: "torso" });
  }
}

/* --------------------------------------------------------------- building helpers */

export function windowsAlong(p, axis, y, length, offset, { count, w = 2, h = 3.2, glass, skip = [] }) {
  const step = length / count;
  for (let i = 0; i < count; i++) {
    if (skip.includes(i)) continue;
    const t = -length / 2 + step * (i + 0.5);
    if (axis === "x") p.box(t, y, offset, w, h, 0.5, glass);
    else p.box(offset, y, t, 0.5, h, w, glass);
  }
}

export function door(p, x, y, z, w = 3, h = 6, color = "black") {
  p.box(x, y, z, w, h, 0.6, color);
  p.box(x, y + h, z + 0.2, w + 1.6, 0.4, 1.4, "white");
  p.box(x + w / 4, y + h / 2.2, z + 0.25, 0.3, 0.3, 0.2, "pearl-gold");
}

export function shell(p, w, d, y, h, color, opts = {}) {
  return p.box(0, y, 0, w, h, d, color, opts);
}

export function band(p, w, d, y, color = "white") {
  p.box(0, y, 0, w + 0.6, PLATE, d + 0.6, color);
}

/* --------------------------------------------------------------- kinds */

function buildTower(p, lot) {
  const floors = lot.floors ?? 6;
  const w = floors >= 9 ? 18 : 20;
  const d = w;
  const glass = lot.glass ?? "trans-light-blue";
  const trim = lot.color === DGRAY ? "black" : "white";
  for (let i = 0; i < floors; i++) {
    const y = G + i * FLOOR;
    shell(p, w, d, y, FLOOR, lot.color, { s: i === floors - 1, solid: i === 0 });
    band(p, w, d, y + FLOOR - PLATE, trim);
    const wy = y + 2.4;
    const skip = i === 0 ? [1, 2] : [];
    windowsAlong(p, "x", wy, w - 4, d / 2, { count: 4, glass, skip });
    windowsAlong(p, "x", wy, w - 4, -d / 2, { count: 4, glass });
    windowsAlong(p, "z", wy, d - 4, w / 2, { count: 4, glass });
    windowsAlong(p, "z", wy, d - 4, -w / 2, { count: 4, glass });
  }
  door(p, 0, G, d / 2 + 0.1, 4, 6);
  p.box(0, G + 6.8, d / 2 + 1.6, 7, PLATE, 3.4, trim);
  const top = G + floors * FLOOR;
  p.box(0, top, 0, w * 0.45, 2.4, d * 0.45, lot.color, { s: true });
  p.box(w * 0.3, top, -d * 0.3, 2, 1.2, 2, GRAY, { s: true });
  p.cyl(0, top + 2.4, 0, 0.3, 5, GRAY);
  p.cyl(0, top + 7.4, 0, 0.5, 0.5, "trans-red", { emissive: true });
  // entrance plaza
  p.box(0, G, d / 2 + 3.5, 10, PLATE, 5, GRAY, { s: true, top: true });
  lampPost(p, -7, d / 2 + 4);
  lampPost(p, 7, d / 2 + 4);
  p.label(lot.label, 0, top + 9.5, 0);
  p.landmark({ id: lot.id, lotId: lot.id, title: lot.label, radius: 9 }, 0, d / 2 + 6, "s");
}

function buildOffice(p, lot) {
  const floors = lot.floors ?? 4;
  const w = 24;
  const d = 16;
  const glass = "trans-light-blue";
  for (let i = 0; i < floors; i++) {
    const y = G + i * FLOOR;
    shell(p, w, d, y, FLOOR, lot.color, { s: i === floors - 1, solid: i === 0 });
    const wy = y + 2.4;
    // glass bands with mullions
    p.box(0, wy, d / 2, w - 2, 3.4, 0.5, glass);
    p.box(0, wy, -d / 2, w - 2, 3.4, 0.5, glass);
    p.box(w / 2, wy, 0, 0.5, 3.4, d - 2, glass);
    p.box(-w / 2, wy, 0, 0.5, 3.4, d - 2, glass);
    for (let m = -w / 2 + 4; m < w / 2; m += 4) {
      p.box(m, wy, d / 2 + 0.1, 0.4, 3.4, 0.5, "black");
      p.box(m, wy, -d / 2 - 0.1, 0.4, 3.4, 0.5, "black");
    }
    band(p, w, d, y + FLOOR - PLATE, "white");
  }
  const top = G + floors * FLOOR;
  // parapet
  p.box(0, top, d / 2 - 0.4, w, 0.8, 0.8, lot.color);
  p.box(0, top, -d / 2 + 0.4, w, 0.8, 0.8, lot.color);
  p.box(w / 2 - 0.4, top, 0, 0.8, 0.8, d, lot.color);
  p.box(-w / 2 + 0.4, top, 0, 0.8, 0.8, d, lot.color);
  p.box(-6, top, -3, 4, 2, 4, GRAY, { s: true });
  p.box(6, top, 3, 3, 1.2, 3, GRAY, { s: true });
  // ground floor door replaces part of glass band
  door(p, 0, G, d / 2 + 0.15, 4, 6, DGRAY);
  p.box(0, G, d / 2 + 2.5, 8, PLATE, 3, GRAY, { s: true, top: true });
  for (const x of [-9, 9]) roundTree(p, x, d / 2 + 4, { size: 0.8 });
  p.label(lot.label, 0, top + 5, 0);
  p.landmark({ id: lot.id, lotId: lot.id, title: lot.label, radius: 9 }, 0, d / 2 + 5, "s");
}

function buildShop(p, lot) {
  const w = 22;
  const d = 14;
  const accent = "white";
  shell(p, w, d, G, FLOOR, lot.color, { solid: true });
  shell(p, w, d, G + FLOOR, FLOOR, accent, { s: true });
  band(p, w, d, G + FLOOR - PLATE, "black");
  // big display window
  p.box(-5, G + 1.2, d / 2, 8, 4.6, 0.5, "trans-clear");
  p.box(6.5, G + 1.2, d / 2, 5, 4.6, 0.5, "trans-clear");
  door(p, 1.5, G, d / 2 + 0.1, 3, 6, "bright-red");
  // striped awning
  for (let i = 0; i < 11; i++) {
    const x = -w / 2 + 1 + i * 2;
    p.wedge(x, G + 6.6, d / 2 + 1.5, 2, 1.2, 3, "s", i % 2 ? "white" : lot.color);
  }
  windowsAlong(p, "x", G + FLOOR + 2.4, w - 4, d / 2, { count: 5, glass: "trans-light-blue" });
  windowsAlong(p, "x", G + FLOOR + 2.4, w - 4, -d / 2, { count: 5, glass: "trans-light-blue" });
  const top = G + 2 * FLOOR;
  // giant smiley on the roof, facing the street
  p.box(0, top, -2, 1.2, 4, 1.2, GRAY);
  p.cyl(0, top + 7, -2, 4.5, 1.2, "bright-yellow", { axis: "z" });
  for (const fz of [-1.3, -2.7]) {
    p.box(-1.5, top + 8.4, fz, 0.9, 1, 0.3, "black");
    p.box(1.5, top + 8.4, fz, 0.9, 1, 0.3, "black");
    p.box(0, top + 5.2, fz, 4, 0.6, 0.3, "black");
    p.box(-2.2, top + 5.8, fz, 0.6, 0.6, 0.3, "black");
    p.box(2.2, top + 5.8, fz, 0.6, 0.6, 0.3, "black");
  }
  p.box(0, G, d / 2 + 3, w, PLATE, 4, GRAY, { s: true, top: true });
  p.label(lot.label, 0, top + 13, -2);
  p.landmark({ id: lot.id, lotId: lot.id, title: lot.label, radius: 9 }, 0, d / 2 + 5, "s");
}

function buildBar(p, lot) {
  const w = 24;
  const d = 14;
  shell(p, w, d, G, FLOOR, lot.color, { solid: true });
  shell(p, w, d, G + FLOOR, FLOOR, "white", { s: true });
  band(p, w, d, G + FLOOR - PLATE, "dark-green");
  p.box(0, G + 1.2, d / 2, w - 8, 4.6, 0.5, "trans-clear");
  door(p, 0, G, d / 2 + 0.1, 3, 6, "dark-green");
  windowsAlong(p, "x", G + FLOOR + 2.4, w - 4, d / 2, { count: 4, glass: "trans-light-blue" });
  windowsAlong(p, "z", G + FLOOR + 2.4, d - 4, w / 2, { count: 2, glass: "trans-light-blue" });
  const top = G + 2 * FLOOR;
  mosaicSign(p, ["MOJITO"], 0, top + 0.4, 1, { color: "lime", bg: "dark-green" });
  // patio with umbrellas
  p.box(0, G, d / 2 + 3.5, w, PLATE, 6, "tan", { s: true, top: true });
  for (const x of [-8, 0, 8]) {
    const z = d / 2 + 3.5;
    p.cyl(x, G + PLATE, z, 1.6, 0.3, "white");
    p.cyl(x, G + PLATE, z, 0.25, 5, "white", { solid: true });
    p.cone(x, G + 5, z, 3.2, 1.4, x === 0 ? "lime" : "white", { seg: 8 });
    p.cyl(x, G + 6.4, z, 0.2, 0.6, "white");
  }
  // giant cocktail glass on the roof
  p.cyl(-9, top, -3, 1.2, 0.3, "trans-clear");
  p.cyl(-9, top + 0.3, -3, 0.3, 3, "trans-clear");
  p.cone(-9, top + 3.3, -3, 2.4, 0.2, "trans-clear", { seg: 12 });
  p.cyl(-9, top + 3.3, -3, 2.3, 1.8, "trans-clear");
  p.cyl(-9, top + 3.4, -3, 2.0, 1.4, "lime");
  p.box(-8.2, top + 5.4, -3, 0.3, 2.2, 0.3, "bright-red");
  p.label(lot.label, 0, top + 10, 0);
  p.landmark({ id: lot.id, lotId: lot.id, title: lot.label, radius: 9 }, 0, d / 2 + 7, "s");
}

function buildHotel(p, lot) {
  const floors = lot.floors ?? 4;
  const w = 26;
  const d = 16;
  for (let i = 0; i < floors; i++) {
    const y = G + i * FLOOR;
    shell(p, w, d, y, FLOOR, lot.color, { s: i === floors - 1, solid: i === 0 });
    band(p, w, d, y + FLOOR - PLATE, "white");
    const wy = y + 2.2;
    const count = 5;
    const skip = i === 0 ? [2] : [];
    windowsAlong(p, "x", wy, w - 4, d / 2, { count, w: 2.4, h: 3.4, glass: "trans-light-blue", skip });
    windowsAlong(p, "x", wy, w - 4, -d / 2, { count, w: 2.4, h: 3.4, glass: "trans-light-blue" });
    windowsAlong(p, "z", wy, d - 4, w / 2, { count: 3, glass: "trans-light-blue" });
    windowsAlong(p, "z", wy, d - 4, -w / 2, { count: 3, glass: "trans-light-blue" });
    if (i > 0) {
      // balconies on the front
      for (let k = 0; k < count; k++) {
        const x = -(w - 4) / 2 + ((w - 4) / count) * (k + 0.5);
        p.box(x, y, d / 2 + 1, 3.2, PLATE, 2, "white");
        p.box(x, y + PLATE, d / 2 + 1.9, 3.2, 1.2, 0.3, "white");
      }
    }
  }
  door(p, 0, G, d / 2 + 0.1, 4, 6, "dark-red");
  // canopy on columns + red carpet
  p.box(0, G + 7.2, d / 2 + 2.5, 8, 0.6, 5, "dark-red");
  p.cyl(-3.2, G, d / 2 + 4.5, 0.4, 7.2, "white");
  p.cyl(3.2, G, d / 2 + 4.5, 0.4, 7.2, "white");
  p.box(0, G, d / 2 + 3, 4, 0.3, 6, "dark-red");
  for (const x of [-10, 10]) palmTree(p, x, d / 2 + 3, 14);
  const top = G + floors * FLOOR;
  mosaicSign(p, ["HOTEL"], 0, top + 0.4, 0, { color: "bright-red", bg: "white" });
  p.label(lot.label, 0, top + 9.5, 0);
  p.landmark({ id: lot.id, lotId: lot.id, title: lot.label, radius: 9 }, 0, d / 2 + 6, "s");
}

function buildSpa(p, lot, rng) {
  const w = 20;
  const d = 14;
  shell(p, w, d, G, FLOOR, lot.color, { solid: true });
  shell(p, w, d, G + FLOOR, FLOOR, "white", { s: true });
  band(p, w, d, G + FLOOR - PLATE, "dark-green");
  windowsAlong(p, "x", G + 2.4, w - 4, d / 2, { count: 4, glass: "trans-clear", skip: [1, 2] });
  windowsAlong(p, "x", G + FLOOR + 2.4, w - 4, d / 2, { count: 4, glass: "trans-clear" });
  windowsAlong(p, "x", G + FLOOR + 2.4, w - 4, -d / 2, { count: 4, glass: "trans-clear" });
  door(p, 0, G, d / 2 + 0.1, 3, 6, "dark-green");
  const top = G + 2 * FLOOR;
  // roof garden
  p.box(0, top, 0, w - 4, PLATE, d - 4, "bright-green", { s: true });
  roundTree(p, -5, -2, { size: 0.6, trunk: 1.2, base: top, solid: false });
  roundTree(p, 5, 3, { size: 0.5, trunk: 1.2, base: top, solid: false, leaf: "lime" });
  // zen garden in front
  p.box(0, G, d / 2 + 3.5, w, PLATE, 6, "tan", { s: true, top: true });
  for (const x of [-7, 7]) {
    p.cyl(x, G + PLATE, d / 2 + 3.5, 1.4, 0.3, "white");
    p.cyl(x, G + PLATE + 0.3, d / 2 + 3.5, 1, 0.3, DGRAY);
    p.cyl(x, G + PLATE + 0.6, d / 2 + 3.5, 0.5, 0.3, DGRAY);
  }
  flowerBed(p, 0, d / 2 + 5, 6, 2, rng);
  lampPost(p, -11, d / 2 + 5, { height: 8 });
  lampPost(p, 11, d / 2 + 5, { height: 8 });
  p.label(lot.label, 0, top + 7, 0);
  p.landmark({ id: lot.id, lotId: lot.id, title: lot.label, radius: 9 }, 0, d / 2 + 6, "s");
}

function buildGarage(p, lot) {
  const w = 24;
  const d = 16;
  const h = FLOOR + 3 * BRICK;
  shell(p, w, d, G, h, GRAY, { s: true, solid: true });
  band(p, w, d, G + h - PLATE, lot.color);
  // two roll-up doors
  for (const x of [-6.5, 6.5]) {
    p.box(x, G, d / 2 + 0.1, 7, 7.2, 0.5, DGRAY);
    for (let k = 0; k < 6; k++) p.box(x, G + 0.6 + k * 1.2, d / 2 + 0.4, 7, 0.3, 0.2, GRAY);
  }
  p.box(0, G + 7.8, d / 2, w - 2, 1.6, 0.5, "trans-clear");
  const top = G + h;
  mosaicSign(p, ["AUTO"], 0, top + 0.4, 0, { color: lot.color, bg: "white" });
  // forecourt, tyres, lift sign
  p.box(0, G, d / 2 + 4, w, PLATE, 8, DGRAY, { s: true, top: true });
  for (let k = 0; k < 3; k++) p.cyl(-10, G + PLATE + k * 0.9, d / 2 + 2, 1.2, 0.9, "black", { solid: k === 0 });
  p.cyl(12.5, G, -2, 0.4, 12, GRAY, { solid: true });
  p.cyl(12.5, G + 12, -2, 2.6, 1, lot.color, { axis: "z", emissive: true });
  car(p, -4, d / 2 + 5, 0, { color: "bright-blue" });
  car(p, 4, d / 2 + 5, 0, { color: "white" });
  p.label(lot.label, 0, top + 8, 0);
  p.landmark({ id: lot.id, lotId: lot.id, title: lot.label, radius: 10 }, 0, d / 2 + 9, "s");
}

function buildChapel(p, lot) {
  const nw = 12;
  const nd = 20;
  const wallH = 2 * FLOOR;
  const roof = lot.roof ?? "dark-pink";
  p.push(0, -1, 0);
  shell(p, nw, nd, G, wallH, lot.color, { solid: true });
  gableRoof(p, 0, G + wallH, 0, nw, nd, roof, { ridge: "z" });
  // arched windows (tall)
  for (let z = -7; z <= 7; z += 3.5) {
    p.box(nw / 2, G + 1.2, z, 0.5, 4, 1.6, "trans-light-blue");
    p.cyl(nw / 2, G + 5.2, z, 0.8, 0.5, "trans-light-blue", { axis: "x" });
    p.box(-nw / 2, G + 1.2, z, 0.5, 4, 1.6, "trans-light-blue");
    p.cyl(-nw / 2, G + 5.2, z, 0.8, 0.5, "trans-light-blue", { axis: "x" });
  }
  door(p, 0, G, nd / 2 + 0.1, 3.2, 6.4, roof);
  p.pop();
  // steeple
  const sx = -9;
  const sz = 4;
  const sw = 6;
  const sh = 4 * FLOOR;
  p.box(sx, G, sz, sw, sh, sw, lot.color, { solid: true });
  p.box(sx, G + sh - PLATE, sz, sw + 0.6, PLATE, sw + 0.6, roof);
  p.box(sx, G + sh - 3, sz, 0.5, 2.4, 2, "black");
  p.cyl(sx, G + sh - 2.4, sz, 0.6, 1.2, "pearl-gold");
  p.cone(sx, G + sh, sz, sw / 2 + 0.3, 9, roof, { seg: 4 });
  p.cyl(sx, G + sh + 9, sz, 0.2, 1.5, "pearl-gold");
  mosaicSign(p, ["♥"], sx, G + sh + 10.5, sz, { color: "bright-red", bg: "white", cell: 0.8, depth: 0.8 });
  // garden path + flowers
  p.box(0, G, 11, 4, PLATE, 4, "white", { s: true, top: true });
  const rng = createRng(7);
  flowerBed(p, 5, 10, 4, 3, rng);
  flowerBed(p, -5, 11, 3, 3, rng);
  roundTree(p, 9, -6, { leaf: "bright-pink", size: 0.9 });
  roundTree(p, 9, 8, { size: 0.8 });
  p.label(lot.label, 0, G + wallH + 12, -1);
  p.landmark({ id: lot.id, lotId: lot.id, title: lot.label, radius: 8 }, 0, 12, "s");
}

export function houseCore(p, { walls = "tan", roof = "dark-red", w = 14, d = 11, trim = "white", floors = 1, chimney = true }) {
  const wallH = floors * FLOOR;
  shell(p, w, d, G, wallH, walls, { solid: true });
  band(p, w, d, G + wallH - PLATE, trim);
  door(p, -w / 4, G, d / 2 + 0.1, 2.4, 6, trim);
  p.box(w / 4, G + 1, d / 2, 3, 2, 0.5, "trans-clear");
  p.box(w / 4 - 1.6, G + 1, d / 2 + 0.2, 0.3, 2, 0.3, trim);
  p.box(w / 4 + 1.6, G + 1, d / 2 + 0.2, 0.3, 2, 0.3, trim);
  p.box(w / 4, G + 1, -d / 2, 3, 2, 0.5, "trans-clear");
  p.box(-w / 4, G + 1, -d / 2, 3, 2, 0.5, "trans-clear");
  p.box(w / 2, G + 1, 0, 0.5, 2, 3, "trans-clear");
  if (floors > 1) {
    p.box(-w / 4, G + FLOOR + 1, d / 2, 3, 2, 0.5, "trans-clear");
    p.box(w / 4, G + FLOOR + 1, d / 2, 3, 2, 0.5, "trans-clear");
  }
  const roofTop = gableRoof(p, 0, G + wallH, 0, w, d, roof, { ridge: "z" });
  if (chimney) p.box(w / 3, G + wallH + 1, -2, 1.6, roofTop - (G + wallH) + 1.5, 1.6, DGRAY, { s: true });
  return wallH;
}

function buildHouse(p, lot) {
  const rng = createRng(5);
  p.push(-3, -2, 0);
  const wallH = houseCore(p, { walls: lot.color, roof: lot.roof ?? "dark-red", w: 14, d: 11, floors: 2 });
  p.pop();
  // garage + driveway
  p.box(8, G, -3, 7, FLOOR, 9, lot.color, { s: true, solid: true });
  p.box(8, G, 1.6, 5.6, 3.2, 0.5, "white");
  for (let k = 0; k < 3; k++) p.box(8, G + 0.6 + k * 0.9, 1.9, 5.6, 0.2, 0.2, GRAY);
  p.box(8, G, 8, 7, PLATE, 10, GRAY, { s: true, top: true });
  car(p, 8, 8, 0, { color: "bright-blue" });
  // front path, lawn, fence, mailbox, tree
  p.box(-6.5, G, 8, 2, PLATE, 10, "white", { s: true, top: true });
  fence(p, -2, 12.5, 18, 0);
  fence(p, -12.5, 2, 20, 1);
  p.cyl(-10.5, G, 11, 0.25, 2.4, "black");
  p.box(-10.5, G + 2.4, 11, 1.2, 0.9, 1.6, "bright-red");
  roundTree(p, -10, -8, { size: 1.1 });
  flowerBed(p, -3, 5, 5, 2, rng);
  flowerBed(p, -10, 5, 4, 2, rng);
  p.label(lot.label, -3, G + wallH + 12, -2);
  p.landmark({ id: lot.id, lotId: lot.id, title: lot.label, radius: 8 }, -6.5, 10, "s");
}

function buildLibrary(p, lot) {
  const w = 24;
  const d = 14;
  const h = 2 * FLOOR;
  p.push(0, -3, 0);
  shell(p, w, d, G, h, lot.color, { s: true, solid: true });
  band(p, w, d, G + h - PLATE, "white");
  windowsAlong(p, "x", G + 2.4, w - 4, d / 2, { count: 5, h: 9, w: 1.6, glass: "trans-light-blue", skip: [2] });
  windowsAlong(p, "x", G + 2.4, w - 4, -d / 2, { count: 5, h: 9, w: 1.6, glass: "trans-light-blue" });
  door(p, 0, G + PLATE * 3, d / 2 + 0.1, 4, 7, "dark-red");
  // steps
  for (let k = 0; k < 3; k++) {
    p.box(0, G + k * PLATE, d / 2 + 5 - k * 1, 20, PLATE, 10 - k * 2, GRAY, { s: k === 2, top: true });
  }
  // portico
  for (const x of [-8, -4, 0, 4, 8]) p.cyl(x, G + PLATE * 3, d / 2 + 5, 0.7, h - PLATE * 3, "white", { solid: true });
  p.box(0, G + h, d / 2 + 3, w, 0.8, 9, "white");
  gableRoof(p, 0, G + h + 0.8, d / 2 + 3, w, 9, "dark-red", { ridge: "x", overhang: 0 });
  mosaicSign(p, ["LIBRARY"], 0, G + h + 5.2, -d / 2 + 3, { color: "dark-red", bg: "white", cell: 0.8, depth: 0.8 });
  p.box(0, G + h, -d / 2 + 3, 24, 5.2, 0.8, "white");
  p.pop();
  const top = G + h + 4.4;
  for (const x of [-11, 11]) roundTree(p, x, 8, { size: 0.9 });
  p.label(lot.label, 0, top + 4, -3);
  p.landmark({ id: lot.id, lotId: lot.id, title: lot.label, radius: 9 }, 0, 10, "s");
}

function buildCivic(p, lot) {
  const w = 24;
  const d = 16;
  const h = 2 * FLOOR;
  shell(p, w, d, G, h, lot.color, { s: true, solid: true });
  band(p, w, d, G + h - PLATE, GRAY);
  windowsAlong(p, "x", G + 2.4, w - 4, d / 2, { count: 6, h: 3.2, glass: "trans-light-blue", skip: [2, 3] });
  windowsAlong(p, "x", G + FLOOR + 2.4, w - 4, d / 2, { count: 6, h: 3.2, glass: "trans-light-blue" });
  windowsAlong(p, "x", G + 2.4, w - 4, -d / 2, { count: 6, h: 3.2, glass: "trans-light-blue" });
  windowsAlong(p, "x", G + FLOOR + 2.4, w - 4, -d / 2, { count: 6, h: 3.2, glass: "trans-light-blue" });
  door(p, 0, G, d / 2 + 0.1, 4, 6.4, DGRAY);
  for (const x of [-4.5, -1.5, 1.5, 4.5]) p.cyl(x, G, d / 2 + 2.5, 0.6, h, GRAY, { solid: true });
  p.box(0, G + h, d / 2 + 1.5, 14, 0.8, 4, GRAY);
  // stepped dome
  const top = G + h;
  p.box(0, top, 0, 10, 1.2, 10, lot.color, { s: true });
  [5, 4.2, 3.2, 2, 0.9].forEach((r, k) => p.cyl(0, top + 1.2 + k * 1.2, 0, r, 1.2, DGRAY));
  p.cyl(0, top + 7.2, 0, 0.2, 2, "pearl-gold");
  // flag
  p.cyl(9, G, d / 2 + 4, 0.25, 12, GRAY);
  p.box(10.3, G + 10, d / 2 + 4, 2.6, 1.6, 0.2, "bright-red");
  p.box(0, G, d / 2 + 4.5, 12, PLATE, 5, GRAY, { s: true, top: true });
  p.label(lot.label, 0, top + 11, 0);
  p.landmark({ id: lot.id, lotId: lot.id, title: lot.label, radius: 9 }, 0, d / 2 + 6, "s");
}

function buildUniversity(p, lot) {
  const trim = "tan";
  // main hall at the back
  const w = 26;
  const d = 10;
  const h = 2 * FLOOR;
  p.push(0, -7, 0);
  shell(p, w, d, G, h, lot.color, { s: true, solid: true });
  band(p, w, d, G + h - PLATE, trim);
  band(p, w, d, G + FLOOR - PLATE, trim);
  windowsAlong(p, "x", G + 2.4, w - 4, d / 2, { count: 8, w: 1.6, glass: "trans-light-blue", skip: [3, 4] });
  windowsAlong(p, "x", G + FLOOR + 2.4, w - 4, d / 2, { count: 8, w: 1.6, glass: "trans-light-blue" });
  windowsAlong(p, "x", G + 2.4, w - 4, -d / 2, { count: 8, w: 1.6, glass: "trans-light-blue" });
  windowsAlong(p, "x", G + FLOOR + 2.4, w - 4, -d / 2, { count: 8, w: 1.6, glass: "trans-light-blue" });
  mosaicSign(p, ["UVAQ"], 0, G + h + 0.4, 0, { color: trim, bg: lot.color });
  p.pop();
  // clock tower in front of the hall
  const tw = 6;
  const th = 5 * FLOOR;
  const tz = -1;
  p.box(0, G, tz, tw, th, tw, lot.color, { solid: true });
  for (let k = 1; k <= 4; k++) p.box(0, G + k * FLOOR - PLATE, tz, tw + 0.6, PLATE, tw + 0.6, trim);
  door(p, 0, G, tz + tw / 2 + 0.1, 3, 6.4, trim);
  p.cyl(0, G + th - 3.4, tz + tw / 2, 2, 0.5, "white", { axis: "z" });
  p.box(0, G + th - 2.2, tz + tw / 2 + 0.4, 0.3, 1.4, 0.2, "black");
  p.box(0.6, G + th - 2.3, tz + tw / 2 + 0.4, 1.2, 0.3, 0.2, "black");
  p.box(0, G + th, tz, tw + 1, 0.8, tw + 1, trim);
  p.cone(0, G + th + 0.8, tz, tw / 2 + 0.5, 5, lot.color, { seg: 4 });
  p.cyl(0, G + th + 5.8, tz, 0.2, 1.5, "pearl-gold");
  // courtyard
  p.box(0, G, 7, 26, PLATE, 10, trim, { s: true, top: true });
  p.box(0, G, 7, 6, 0.3, 10, GRAY);
  for (const x of [-9, 9]) {
    roundTree(p, x, 8, { size: 0.9 });
    bench(p, x, 3, 2);
  }
  lampPost(p, -4, 11, { height: 8 });
  lampPost(p, 4, 11, { height: 8 });
  p.label(lot.label, 0, G + th + 10, tz);
  p.landmark({ id: lot.id, lotId: lot.id, title: lot.label, radius: 10 }, 0, 9, "s");
}

function buildPostOffice(p, lot) {
  const w = 20;
  const d = 14;
  const h = FLOOR + 2 * BRICK;
  p.push(0, -2, 0);
  shell(p, w, d, G, h, lot.color, { s: true, solid: true });
  band(p, w, d, G + h - PLATE, "white");
  windowsAlong(p, "x", G + 2.4, w - 4, d / 2, { count: 4, glass: "trans-clear", skip: [1, 2] });
  windowsAlong(p, "x", G + 2.4, w - 4, -d / 2, { count: 4, glass: "trans-clear" });
  door(p, 0, G, d / 2 + 0.1, 4, 6, "white");
  p.box(0, G + 6.6, d / 2 + 1.2, 8, PLATE, 2.6, "white");
  mosaicSign(p, ["POST"], 0, G + h + 0.4, 0, { color: "white", bg: lot.color });
  p.pop();
  // mailbox, flag, van
  p.cyl(-8, G, 9, 0.3, 2.4, GRAY);
  p.box(-8, G + 2.4, 9, 2, 1.6, 1.4, lot.color);
  p.cyl(-8, G + 4, 9, 0.7, 2, lot.color, { axis: "x" });
  p.cyl(9, G, 10, 0.25, 11, GRAY);
  p.box(10.3, G + 9, 10, 2.6, 1.6, 0.2, "bright-red");
  p.box(0, G, 9, 12, PLATE, 8, GRAY, { s: true, top: true });
  car(p, 2, 9, 1, { color: "white", kind: "van" });
  p.label(lot.label, 0, G + h + 7, -2);
  p.landmark({ id: lot.id, lotId: lot.id, title: lot.label, radius: 9 }, -4, 10, "s");
}

function buildPlaza(p, lot) {
  const rng = createRng(3);
  // fountain
  p.cyl(0, G, 0, 6.5, 1.2, GRAY, { solid: true });
  p.cyl(0, G + 1.2, 0, 6, 0.3, GRAY);
  p.cyl(0, G + 0.6, 0, 5.6, 0.7, "trans-light-blue");
  p.cyl(0, G + 1.2, 0, 1.6, 2.4, GRAY);
  p.cyl(0, G + 3.6, 0, 3, 0.4, GRAY);
  p.cyl(0, G + 4, 0, 2.6, 0.4, "trans-light-blue");
  p.cyl(0, G + 4.4, 0, 0.6, 1.6, GRAY);
  p.cyl(0, G + 6, 0, 0.5, 3, "trans-clear");
  p.cyl(0, G + 9, 0, 1, 0.6, "trans-clear");
  p.light("accent", 0, G + 4.5, 0, { c: "trans-light-blue", size: 1.4 });
  // name sign at the back
  mosaicSign(p, lot.sign ?? ["HECTOR", "MENDOZA"], 0, G + 1.2, -10.5, { color: "bright-red", bg: "white", depth: 1.2 });
  p.box(0, G, -10.5, 30, 1.2, 2.4, GRAY, { solid: true });
  // benches, lamps, flower beds
  for (const [x, z, rot] of [[-9, 0, 1], [9, 0, 3], [0, 9, 2], [-5, -6, 0], [5, -6, 0]]) bench(p, x, z, rot);
  for (const [x, z] of [[-11, -11], [11, -11], [-11, 11], [11, 11]]) lampPost(p, x, z);
  flowerBed(p, -9, 7, 4, 4, rng);
  flowerBed(p, 9, 7, 4, 4, rng);
  flowerBed(p, -9, -7, 4, 3, rng);
  flowerBed(p, 9, -7, 4, 3, rng);
  // a few citizens
  p.push(-4, 5, 2);
  minifig(p, { torso: "bright-red", legs: "dark-blue" });
  p.pop();
  p.push(6, -3, -1);
  minifig(p, { torso: "lime", legs: "black", hair: "black" });
  p.pop();
  p.label(lot.label, 0, G + 14, 0);
  p.landmark({ id: lot.id, lotId: lot.id, title: lot.label, radius: 12 }, 0, 9, "s");
}

function buildStation(p, lot) {
  const roof = lot.roof ?? "bright-red";
  // station house at the back
  const w = 20;
  const d = 9;
  const h = 2 * FLOOR;
  p.push(0, -7.5, 0);
  shell(p, w, d, G, h, lot.color, { s: true, solid: true });
  band(p, w, d, G + h - PLATE, "tan");
  band(p, w, d, G + FLOOR - PLATE, "tan");
  windowsAlong(p, "x", G + 2.4, w - 4, d / 2, { count: 5, glass: "trans-light-blue", skip: [2] });
  windowsAlong(p, "x", G + FLOOR + 2.4, w - 4, d / 2, { count: 5, glass: "trans-light-blue" });
  windowsAlong(p, "x", G + 2.4, w - 4, -d / 2, { count: 5, glass: "trans-light-blue" });
  windowsAlong(p, "x", G + FLOOR + 2.4, w - 4, -d / 2, { count: 5, glass: "trans-light-blue" });
  door(p, 0, G, d / 2 + 0.1, 4, 6.4, "tan");
  p.cyl(0, G + h - 2.5, d / 2, 1.6, 0.5, "white", { axis: "z" });
  p.box(0, G + h - 1.8, d / 2 + 0.4, 0.25, 1.2, 0.2, "black");
  p.box(0.5, G + h - 1.9, d / 2 + 0.4, 1, 0.25, 0.2, "black");
  gableRoof(p, 0, G + h, 0, w, d, roof, { ridge: "x" });
  p.pop();
  // platform + canopy
  p.box(0, G, 5.5, 30, PLATE, 11, GRAY, { s: true, top: true });
  p.box(0, G + PLATE, 11.5, 30, 0.2, 1, "bright-yellow");
  for (const x of [-12, -4, 4, 12]) p.cyl(x, G + PLATE, 4, 0.45, 12, "white", { solid: true });
  p.box(0, G + PLATE + 12, 5, 30, 0.6, 8, roof);
  p.box(0, G + PLATE + 12.6, 5, 30, 0.4, 8, "white");
  mosaicSign(p, ["STATION"], 0, G + PLATE + 13, 9, { color: "white", bg: roof, cell: 0.9, depth: 0.8 });
  // benches, signs, waiting minifigs
  bench(p, -8, 6, 2);
  bench(p, 8, 6, 2);
  p.push(-3, 8, 2);
  minifig(p, { torso: "bright-yellow", legs: "dark-blue", hair: "black", print: "buttons", accessory: "backpack", face: "grin" });
  p.pop();
  p.push(4, 7, 2);
  minifig(p, { torso: "dark-azure", legs: "black", hat: "white", print: "stripes", face: "wink" });
  p.pop();
  p.label(lot.label, 0, G + 16, -6);
  p.landmark({ id: lot.id, lotId: lot.id, title: lot.label, radius: 12 }, 0, 9, "s");
}

function buildPark(p, lot, rng) {
  // crossing tile paths (smooth tiles sit one plate above the studs)
  p.box(0, G, 0, 3, 0.3, 26, "tan");
  p.box(0, G, 0, 26, 0.3, 3, "tan");
  if (lot.pond) {
    p.cyl(-5, G, -5, 7, 0.3, "tan");
    p.cyl(-5, G + 0.25, -5, 6.2, 0.2, "trans-light-blue");
    // ducks
    for (let k = 0; k < 3; k++) {
      const a = rng.range(0, Math.PI * 2);
      const r = rng.range(1, 4.5);
      p.box(-5 + Math.cos(a) * r, G + 0.35, -5 + Math.sin(a) * r, 0.8, 0.5, 1, "bright-yellow");
    }
  }
  if (lot.wheel) {
    // Ferris wheel: a dynamic group rotating about the local x axis
    const cx = -4;
    const cz = -1;
    const r = 11;
    const hubY = G + 14;
    p.box(cx - 4, G, cz, 1.4, hubY - G, 1.4, "white", { solid: true });
    p.box(cx + 4, G, cz, 1.4, hubY - G, 1.4, "white", { solid: true });
    p.box(cx, hubY - 0.5, cz, 9.5, 1, 1, DGRAY);
    p.push(cx, cz, 0);
    p.beginDynamic("wheel", { pivotY: hubY, radius: r, axis: "x" });
    for (let k = 0; k < 24; k++) {
      const a = (k / 24) * Math.PI * 2;
      p.box(0, hubY + Math.sin(a) * r - 0.25, Math.cos(a) * r, 0.5, 0.5, 0.5, k % 2 ? "trans-yellow" : "trans-red", { emissive: true });
    }
    p.cyl(0, hubY - 1, 0, 1.2, 2, DGRAY, { axis: "x" });
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      const gy = hubY + Math.sin(a) * r;
      const gz = Math.cos(a) * r;
      p.box(0, gy - 2, gz, 3, 3.2, 3, ["bright-red", "bright-yellow", "bright-blue", "lime"][k % 4], { part: "gondola" });
      // spoke
      const sy = hubY + Math.sin(a) * r * 0.5;
      const sz = Math.cos(a) * r * 0.5;
      p.box(0, sy - 0.2, sz, 0.4, 0.4, 0.4, GRAY);
    }
    p.endDynamic();
    p.pop();
    p.box(8, G, 8, 6, 2.4, 4, "white", { solid: true });
    for (let i = 0; i < 6; i++) p.wedge(5.5 + i, G + 2.4, 8, 1, 1.2, 4.4, "s", i % 2 ? "bright-red" : "white");
    p.cyl(10.8, G + 2.4, 8, 0.6, 2.4, "tan");
    p.cyl(10.8, G + 4.8, 8, 0.9, 0.9, "bright-pink");
  }
  const trees = rng.int(5, 8);
  for (let i = 0; i < trees; i++) {
    let x = rng.range(-11, 11);
    let z = rng.range(-11, 11);
    if (Math.abs(x) < 2.5 || Math.abs(z) < 2.5) continue;
    if (lot.pond && Math.hypot(x + 5, z + 5) < 8) continue;
    if (lot.wheel && Math.hypot(x + 4, z + 1) < 14) continue;
    if (lot.wheel && x > 4 && z > 4) continue;
    if (rng.chance(0.4)) pineTree(p, x, z, { size: rng.range(0.8, 1.3) });
    else roundTree(p, x, z, { size: rng.range(0.7, 1.2), leaf: rng.pick(["bright-green", "green", "lime"]) });
  }
  bench(p, 5, 3, 0);
  bench(p, -5, 3, 0);
  lampPost(p, 3, -3, { height: 8 });
  lampPost(p, -3, 3, { height: 8 });
  p.push(2, 6, 0);
  minifig(p, { torso: rng.pick(["bright-red", "lime", "dark-azure", "bright-pink"]), legs: rng.pick(["dark-blue", "black", "tan"]) });
  p.pop();
  p.label(lot.label, 0, G + 12, 0, { minor: true });
  p.landmark({ id: lot.id, lotId: lot.id, title: lot.label, radius: 14 }, 0, 0, "s");
}

function buildResidential(p, lot, rng) {
  const walls = ["tan", "white", "bright-light-orange", "sand-green", "lavender", "medium-azure"];
  const roofs = ["dark-red", "reddish-brown", "dark-bluish-gray", "dark-green", "bright-red"];
  // two houses side by side + one at the back
  const layout = [
    [-6.5, 4, 0],
    [6.5, 4, 0],
    [0, -7, 2],
  ];
  for (const [x, z, rot] of layout) {
    p.push(x, z, rot);
    houseCore(p, { walls: rng.pick(walls), roof: rng.pick(roofs), w: 9, d: 8, chimney: rng.chance(0.6) });
    p.pop();
  }
  p.box(0, G, 9, 3, 0.3, 8, "white");
  fence(p, 0, 12.8, 26, 0, "white");
  if (rng.chance(0.7)) car(p, -10, 9, 0, { color: rng.pick(["bright-red", "white", "bright-yellow", "dark-azure"]) });
  roundTree(p, 11, -2, { size: rng.range(0.8, 1.1) });
  roundTree(p, -11, -2, { size: rng.range(0.8, 1.1) });
  flowerBed(p, 0, 1, 4, 2, rng);
  p.label(lot.label, 0, G + 10, 0, { minor: true });
  p.landmark({ id: lot.id, lotId: lot.id, title: lot.label, radius: 9 }, 0, 10, "s");
}

/** A parked passenger jet, long axis along x, centred on (cx, cz). */
export function jet(p, cx, pz, red = "bright-red") {
  const py = G + 3.3;
  p.push(cx, 0, 0);
  p.cyl(-1, py, pz, 2.2, 20, "white", { axis: "x" });
  for (const [x, r] of [[10.2, 1.8], [11.4, 1.3], [12.4, 0.8]]) p.cyl(x, py, pz, r, 1.2, x > 11 ? "light-bluish-gray" : "white", { axis: "x" });
  for (const [x, r] of [[-11.2, 1.8], [-12.4, 1.3], [-13.4, 0.8]]) p.cyl(x, py, pz, r, 1.2, "white", { axis: "x" });
  p.cyl(-1, py + 0.2, pz, 2.25, 20, red, { axis: "x", seg: 12 });
  p.cyl(-1, py + 0.25, pz, 2.3, 19.6, "white", { axis: "x" });
  p.box(-1, py - 0.7, pz, 20, 0.3, 4.5, "light-bluish-gray");
  for (let i = 0; i < 9; i++) p.box(-8 + i * 1.9, py + 0.9, pz + 2.25, 1, 0.9, 0.2, "trans-light-blue");
  p.box(10.2, py + 0.7, pz + 0.3, 1.6, 1, 3, "dark-blue");
  // wings (swept), engines, tail
  p.box(-0.5, py - 1.2, pz, 6, 0.5, 20, "light-bluish-gray");
  p.box(-3.5, py - 1.2, pz, 3, 0.5, 14, "light-bluish-gray");
  for (const side of [-1, 1]) {
    p.cyl(0.5, py - 2.1, pz + side * 6.5, 1.1, 3.4, DGRAY, { axis: "x" });
    p.cyl(2.3, py - 2.1, pz + side * 6.5, 0.9, 0.5, GRAY, { axis: "x" });
    p.box(-12.2, py + 0.6, pz + side * 2.8, 3, 0.4, 5, "light-bluish-gray");
  }
  p.box(-11.6, py + 1.2, pz, 4, 5.4, 0.7, red);
  p.box(-11.6, py + 1.8, pz, 4.4, 0.5, 0.8, "white");
  p.pop();
}

function buildAirport(p, lot) {
  const red = "bright-red";
  // apron
  p.box(0, G, 3, 28, 0.3, 20, DGRAY, { top: true });
  for (let x = -12; x <= 12; x += 6) p.box(x, G + 0.3, 11, 3, 0.05, 0.4, "bright-yellow");
  p.box(0, G + 0.3, 3, 26, 0.05, 0.4, "bright-yellow");
  // terminal: two storeys of glass with a swooping roof
  const tw = 26;
  const td = 9;
  p.push(0, -8, 0);
  shell(p, tw, td, G, FLOOR, "white", { s: true, solid: true });
  p.box(0, G + FLOOR, 0, tw - 2, FLOOR * 0.7, td - 1, "white", { solid: true });
  windowsAlong(p, "x", G + 1.8, tw - 3, td / 2, { count: 7, w: 2.6, h: 3.6, glass: "trans-light-blue", skip: [3] });
  windowsAlong(p, "x", G + FLOOR + 1.2, tw - 4, td / 2 - 0.5, { count: 7, w: 2.6, h: 2.6, glass: "trans-light-blue" });
  door(p, 0, G, td / 2 + 0.1, 4.4, 5.6, "black");
  band(p, tw, td, G + FLOOR - PLATE, red);
  p.box(0, G + FLOOR * 1.7, 0, tw + 2, 0.8, td + 2, red, { s: true });
  p.box(0, G + FLOOR * 1.7 + 0.8, 0, tw - 2, 0.6, td - 2, "white", { s: true });
  p.pop();
  mosaicSign(p, ["AIRPORT"], 0, G + FLOOR * 1.7 + 1.6, -3.6, { color: "white", bg: red, cell: 0.5, depth: 0.6 });
  // control tower
  p.cyl(11, G, -8, 1.9, 22, "white", { solid: true });
  p.cyl(11, G + 22, -8, 3.2, 1.2, DGRAY);
  p.box(11, G + 23.2, -8, 5.6, 2.6, 5.6, "trans-light-blue");
  p.box(11, G + 25.8, -8, 6.4, 0.7, 6.4, red);
  p.cyl(11, G + 26.5, -8, 0.25, 3, GRAY);
  p.cyl(11, G + 29.5, -8, 0.5, 0.5, "trans-red", { emissive: true });
  p.light("accent", 11, G + 29.8, -8, { c: "trans-red", size: 2 });
  jet(p, 0, 4);
  // jet bridge from the terminal to the door
  p.box(3, G + 4.4, -2, 1.8, 1.8, 5, GRAY);
  p.box(3, G + 2, 0.6, 0.6, 2.4, 0.6, DGRAY);
  p.box(3, G + 4.2, 1.6, 1.8, 2, 1, "bright-yellow");
  // ground crew: baggage cart train + a fuel truck
  for (const x of [-11, -8.4, -5.8]) {
    p.box(x, G + 0.8, 11.4, 2.2, 0.5, 2, GRAY);
    p.box(x, G + 1.3, 11.4, 1.6, 1.1, 1.4, "reddish-brown");
    p.cyl(x - 0.7, G + 0.55, 12.4, 0.4, 0.3, "black", { axis: "x" });
    p.cyl(x + 0.7, G + 0.55, 12.4, 0.4, 0.3, "black", { axis: "x" });
  }
  p.box(-4, G + 1.2, 11.4, 2.4, 1.4, 1.8, "bright-yellow");
  p.push(11, 9, 1);
  car(p, 0, 0, 0, { color: "bright-yellow", kind: "van" });
  p.pop();
  p.push(-3, 12.3, 0);
  minifig(p, { torso: "orange", legs: "dark-blue", hat: "white" });
  p.pop();
  p.push(6, 12.3, 2);
  minifig(p, { torso: "dark-azure", legs: "black", hair: "black" });
  p.pop();
  lampPost(p, -11, 13);
  lampPost(p, 11, 13);
  // windsock
  p.cyl(-12, G, -1, 0.15, 6, "white");
  p.box(-11, G + 5.4, -1, 2, 0.6, 0.6, "orange");
  p.label(lot.label, 0, G + FLOOR * 1.7 + 8, -8);
  p.landmark({ id: lot.id, lotId: lot.id, title: lot.label, radius: 12 }, 0, 13, "s");
}

/** Lets other modules (world landmarks) add lot kinds without a circular import. */
export function registerBuilders(map, grounds = {}) {
  Object.assign(BUILDERS, map);
  Object.assign(LOT_GROUND, grounds);
}

export const BUILDERS = {
  airport: buildAirport,
  tower: buildTower,
  office: buildOffice,
  shop: buildShop,
  bar: buildBar,
  hotel: buildHotel,
  spa: buildSpa,
  garage: buildGarage,
  chapel: buildChapel,
  house: buildHouse,
  library: buildLibrary,
  civic: buildCivic,
  university: buildUniversity,
  postoffice: buildPostOffice,
  plaza: buildPlaza,
  station: buildStation,
  park: buildPark,
  residential: buildResidential,
};

/** Ground colour under each kind of lot (the "inner plate"). */
export const LOT_GROUND = {
  tower: GRAY,
  office: GRAY,
  shop: GRAY,
  bar: GRAY,
  hotel: "tan",
  spa: "bright-green",
  garage: DGRAY,
  chapel: "bright-green",
  house: "bright-green",
  library: "tan",
  civic: GRAY,
  university: "bright-green",
  postoffice: GRAY,
  plaza: "dark-tan",
  station: GRAY,
  park: "bright-green",
  residential: "bright-green",
  airport: GRAY,
};

export function buildLot(p, lot, seed = 1) {
  const builder = BUILDERS[lot.kind];
  if (!builder) throw new Error(`No builder for lot kind "${lot.kind}" (${lot.id})`);
  builder(p, lot, createRng((lot.seed ?? seed) * 7919 + 13));
}
