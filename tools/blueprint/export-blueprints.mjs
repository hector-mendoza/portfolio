#!/usr/bin/env node
/**
 * Draws Pilleland as blueprints: a minifig sheet (front, side, back, top) and a
 * plan view of every city, as SVG in public/city/blueprints/. It uses
 * gkjohnson/three-edge-projection (pinned in tools/blueprint/package.json) to
 * extract the visible edges of the real brick geometry.
 *
 *   npm run city:blueprints:install   # once
 *   npm run city:blueprints           # everything
 *   npm run city:blueprints -- --only minifig
 *   npm run city:blueprints -- --only paris
 */
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { ProjectionGenerator } from "three-edge-projection";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CITIES } from "../../lib/lego-city/cities.js";
import { compileCity } from "../../lib/lego-city/compile.js";
import { Parts } from "../../lib/lego-city/parts.js";
import { minifig, MINIFIG_HEIGHT } from "../../lib/lego-city/builders.js";
import { createGeometries, geometryFor, itemMatrix } from "../../lib/lego-city/three/geometry.js";
import { BLUEPRINT_COLORS, blueprintSvg, cleanSegments, segmentBounds } from "../../lib/lego-city/blueprint.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const outDir = path.join(root, "public/city/blueprints");
const only = process.argv.includes("--only") ? process.argv[process.argv.indexOf("--only") + 1] : null;

const geos = createGeometries();
const matrix = new THREE.Matrix4();

/** Merges brick primitives into one position-only geometry (wedges are skipped: none in view). */
function itemsToGeometry(items) {
  const list = [];
  for (const it of items) {
    if (it.t === "wedge") continue;
    const g = geometryFor(geos, it).clone();
    itemMatrix(it, matrix);
    g.applyMatrix4(matrix);
    for (const k of Object.keys(g.attributes)) if (k !== "position") g.deleteAttribute(k);
    list.push(g);
  }
  return mergeGeometries(list, false);
}

/** Visible (and optionally hidden) edges seen looking straight down -y, as [x, z, x, z] segments. */
function project(geometry, { hidden = false, angle = 20 } = {}) {
  const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial());
  mesh.updateMatrixWorld(true);
  const gen = new ProjectionGenerator();
  gen.angleThreshold = angle;
  const task = gen.generate(mesh, {});
  let step = task.next();
  while (!step.done) step = task.next();
  const result = step.value;
  const segs = (edges) => {
    const p = edges.getLineGeometry().attributes.position.array;
    const out = [];
    for (let i = 0; i < p.length; i += 6) out.push([p[i], p[i + 2], p[i + 3], p[i + 5]]);
    return out;
  };
  return { visible: segs(result.visibleEdges), hidden: hidden ? segs(result.hiddenEdges) : [] };
}

/* ------------------------------------------------------------ minifig sheet */

function minifigSheet() {
  const p = new Parts();
  minifig(p, { torso: "bright-red", legs: "dark-blue", hair: "black", print: "buttons", accessory: "backpack" });
  const base = itemsToGeometry(p.items);
  // Each view looks straight down -y after turning the figure. The figure's face is on -z, so
  // "front" tips it onto its back (+90° about x); side and back turn it first.
  const rx = (a) => new THREE.Matrix4().makeRotationX(a);
  const ry = (a) => new THREE.Matrix4().makeRotationY(a);
  const turns = {
    front: rx(Math.PI / 2),
    side: rx(Math.PI / 2).multiply(ry(Math.PI / 2)),
    back: rx(Math.PI / 2).multiply(ry(Math.PI)),
    top: new THREE.Matrix4(),
  };
  const S = 10; // drawing units per stud
  const C = BLUEPRINT_COLORS;
  const baseline = 86;
  const gap = 20;
  let cursor = 34; // leaves room for the height dimension on the left
  const views = [];
  for (const [name, m] of Object.entries(turns)) {
    const elevation = name !== "top";
    const { visible, hidden } = project(base.clone().applyMatrix4(m), { hidden: elevation });
    // which way is "up" in the projected plane? follow the figure's own y axis through the turn
    const up = Math.sign(new THREE.Vector3(0, 1, 0).applyMatrix4(m).z) || 1;
    const all = visible.concat(hidden);
    const b = segmentBounds(all);
    const cx = (b.x0 + b.x1) / 2;
    const feet = up > 0 ? b.y0 : b.y1;
    const cy = (b.y0 + b.y1) / 2;
    const map = elevation ? (x, y) => [(x - cx) * S, -(y - feet) * up * S] : (x, y) => [(x - cx) * S, (y - cy) * S];
    const conv = (list) => cleanSegments(list.map(([ax, ay, bx, by]) => [...map(ax, ay), ...map(bx, by)]), 1);
    const seg = conv(visible);
    const hid = conv(hidden);
    const nb = segmentBounds(seg.concat(hid));
    const w = nb.x1 - nb.x0;
    views.push({ name, seg, hid, nb, w, x: cursor + w / 2, y: elevation ? baseline : 52 });
    cursor += w + gap;
  }
  const width = cursor - gap + 24;
  const height = 104;
  const sheet = views.map((v) => ({
    segments: v.seg,
    hidden: v.hid,
    at: [v.x, v.y],
    label: v.name.toUpperCase(),
    labelAt: [0, v.name === "top" ? v.nb.y1 + 9 : 8],
  }));
  // height dimension on the left of the front view
  const f = views[0];
  const dx = f.x + f.nb.x0 - 9;
  const topY = baseline + f.nb.y0;
  sheet[0].marks = [
    `<g stroke="${C.accent}" stroke-width="0.35" fill="none"><path d="M${dx - f.x} ${topY - baseline}V0M${dx - f.x - 2} ${topY - baseline}h4M${dx - f.x - 2} 0h4"/></g>`,
    `<text x="${dx - f.x - 4}" y="${(topY - baseline) / 2}" font-size="3.4" fill="${C.accent}" text-anchor="end">${MINIFIG_HEIGHT} studs</text>`,
    `<text x="${dx - f.x - 4}" y="${(topY - baseline) / 2 + 4}" font-size="2.6" fill="${C.text}" text-anchor="end">≈ ${MINIFIG_HEIGHT * 8} mm</text>`,
  ];
  return blueprintSvg({
    views: sheet,
    title: "MINIFIG",
    subtitle: "Front · side · back · top",
    note: "1 stud = 8 mm · edges by three-edge-projection",
    width,
    height,
    scale: 8,
    lineWidth: 0.4,
    labelSize: 3,
  });
}

/* ---------------------------------------------------------------- city plan */

const LEAF = new Set(["bright-green", "green", "lime", "dark-green"]);

function citySheet(entry) {
  const city = compileCity(entry.spec);
  const L = city.layout;
  const lim = L.half;
  const isLeaf = (it) => it.t === "box" && LEAF.has(it.c) && it.h <= 0.45 && it.w < 2.2 && it.d < 2.2 && !it.s;
  const isTree = (it) => (it.t === "box" && it.c === "reddish-brown" && it.w >= 1.4 && it.w <= 2.2 && it.h > 3) || (it.t === "cyl" && it.c === "reddish-brown" && it.r >= 0.5 && it.r <= 0.8 && it.h >= 3);
  const isHill = (it) => it.t === "cyl" && it.seg === 8 && LEAF.has(it.c); // the stepped foothills around the baseplate
  const inside = (it) => Math.abs(it.x) <= lim && Math.abs(it.z) <= lim && !isHill(it);
  const items = city.items.filter(
    (it) => !it.g && it.y >= 0.5 && inside(it) && !isLeaf(it) && !(it.t === "box" && Math.min(it.w, it.d) < 0.55 && it.h < 4.5) && !(it.t === "cyl" && it.r < 0.3),
  );
  const trees = city.items.filter((it) => !it.g && inside(it) && isTree(it));
  const t0 = performance.now();
  const { visible } = project(itemsToGeometry(items), { angle: 25 });
  const seg = cleanSegments(visible, 1);
  // block outlines (the roads are the gaps) and the sidewalk rings
  const extra = [];
  const rect = (x0, z0, x1, z1) => extra.push([x0, z0, x1, z0], [x1, z0, x1, z1], [x1, z1, x0, z1], [x0, z1, x0, z0]);
  for (const lot of city.lots) {
    const r = lot.rect;
    rect(r.x0, r.z0, r.x0 + r.size, r.z0 + r.size);
    rect(r.cx - r.innerHalf, r.cz - r.innerHalf, r.cx + r.innerHalf, r.cz + r.innerHalf);
  }
  rect(-L.half, -L.half, L.half, L.half);
  const margin = 14;
  const x0 = -L.half - margin;
  const z0 = -L.half - margin;
  const width = (L.half + margin) * 2;
  const height = width + 30;
  const shift = (list) => list.map(([a, b, c, d]) => [a - x0, b - z0, c - x0, d - z0]);
  const C = BLUEPRINT_COLORS;
  // every lot is named in the road below it
  const labels = city.lots.filter((l) => l.label).map((l) => ({ x: l.rect.cx - x0, y: l.rect.z0 + l.rect.size + 6 - z0, text: l.label.toUpperCase(), size: 2.6 }));
  const treeMarks = trees.map((t) => `<circle cx="${(t.x - x0).toFixed(1)}" cy="${(t.z - z0).toFixed(1)}" r="${t.t === "cyl" ? 3.4 : 4.4}"/>`).join("");
  // water lots get wave lines so rivers and sea read as water on the plan
  const waves = city.lots
    .filter((l) => l.kind === "river" || l.kind === "sea")
    .map((l) => {
      const r = l.rect;
      const half = l.kind === "sea" ? r.half : r.innerHalf;
      const x = r.cx - half - x0;
      let d = "";
      for (let i = 1; i <= 5; i++) d += `M${x.toFixed(1)} ${(r.cz - half + (i * half * 2) / 6 - z0).toFixed(1)}q2 -1.6 4 0${"t4 0".repeat(Math.floor((half * 2) / 4) - 1)}`;
      return `<path d="${d}"/>`;
    })
    .join("");
  const scaleBarStart = 12;
  const marks = [
    `<g stroke="${C.hidden}" stroke-opacity="0.7" stroke-width="0.25" fill="none">${waves}</g>`,
    `<g stroke="${C.hidden}" stroke-opacity="0.8" stroke-width="0.2" fill="none">${treeMarks}</g>`,
    // scale bar: 50 studs
    `<g stroke="${C.line}" stroke-width="0.5"><path d="M${scaleBarStart} ${height - 10}h50M${scaleBarStart} ${height - 12}v4M${scaleBarStart + 50} ${height - 12}v4"/></g>`,
    `<text x="${scaleBarStart + 25}" y="${height - 14}" font-size="3.4" fill="${C.text}" text-anchor="middle">50 studs · 40 cm of bricks</text>`,
    // north arrow
    `<g transform="translate(${width - 24} 24)" stroke="${C.accent}" fill="none" stroke-width="0.6"><path d="M0 8V-8M-4 -3L0 -8L4 -3"/><text x="0" y="-11" font-size="5" fill="${C.accent}" stroke="none" text-anchor="middle">N</text></g>`,
  ];
  const svg = blueprintSvg({
    views: [{ segments: shift(seg).concat(shift(extra)), at: [0, 0], labels, marks }],
    title: entry.name.toUpperCase(),
    subtitle: `Plan view · ${city.lots.length} lots`,
    note: "1 stud = 8 mm · edges by three-edge-projection",
    width,
    height,
    scale: 4,
    lineWidth: 0.22,
    labelSize: 2.6,
    uiScale: width / 160,
    grid: 16,
  });
  console.log(`${entry.id}: ${items.length} items, ${trees.length} trees → ${seg.length} edges, ${(svg.length / 1e6).toFixed(2)} MB, ${Math.round((performance.now() - t0) / 1000)} s`);
  return svg;
}

await mkdir(outDir, { recursive: true });
if (!only || only === "minifig") {
  await writeFile(path.join(outDir, "minifig.svg"), minifigSheet());
  console.log("minifig.svg written");
}
for (const entry of CITIES.filter((c) => c.spec)) {
  if (only && only !== "plans" && only !== entry.id) continue;
  await writeFile(path.join(outDir, `${entry.id}.svg`), citySheet(entry));
}
