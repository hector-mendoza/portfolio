/**
 * Pure helpers for the blueprint drawings: take projected 2D line segments
 * ([x1, y1, x2, y2] in studs) and turn them into a compact blueprint-style SVG.
 * The projection itself (tools/blueprint) is a dev-time step; this file has no
 * dependencies so it can be unit-tested and reused.
 */

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

/** Rounds to `decimals`, drops zero-length segments and exact duplicates (either direction). */
export function cleanSegments(segments, decimals = 1) {
  const k = 10 ** decimals;
  const seen = new Set();
  const out = [];
  for (const [x1, y1, x2, y2] of segments) {
    const a = [Math.round(x1 * k), Math.round(y1 * k)];
    const b = [Math.round(x2 * k), Math.round(y2 * k)];
    if (a[0] === b[0] && a[1] === b[1]) continue;
    const key = a[0] < b[0] || (a[0] === b[0] && a[1] <= b[1]) ? `${a}|${b}` : `${b}|${a}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push([a[0] / k, a[1] / k, b[0] / k, b[1] / k]);
  }
  return out;
}

export function segmentBounds(segments) {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const [ax, ay, bx, by] of segments) {
    x0 = Math.min(x0, ax, bx);
    y0 = Math.min(y0, ay, by);
    x1 = Math.max(x1, ax, bx);
    y1 = Math.max(y1, ay, by);
  }
  return { x0, y0, x1, y1, w: x1 - x0, h: y1 - y0 };
}

/**
 * One compact SVG path for a list of segments. Consecutive segments that share
 * an endpoint continue the same subpath, which keeps city plans a fraction of
 * the size of one <line> per segment.
 */
export function segmentsToPath(segments, map = (x, y) => [x, y], decimals = 1) {
  const fmt = (n) => Number(n.toFixed(decimals)).toString();
  let d = "";
  let cx = NaN;
  let cy = NaN;
  for (const [ax, ay, bx, by] of segments) {
    const [px, py] = map(ax, ay);
    const [qx, qy] = map(bx, by);
    if (px !== cx || py !== cy) d += `M${fmt(px)} ${fmt(py)}`;
    d += `L${fmt(qx)} ${fmt(qy)}`;
    cx = qx;
    cy = qy;
  }
  return d;
}

export const BLUEPRINT_COLORS = { paper: "#0c3b6e", grid: "#1d5a9c", line: "#e9f3ff", hidden: "#7fb2e8", accent: "#ffd23f", text: "#cfe4ff" };

/** Faint drawing grid every `step` studs across a box. */
function gridPath(x0, y0, w, h, step) {
  let d = "";
  for (let x = Math.ceil(x0 / step) * step; x <= x0 + w; x += step) d += `M${x} ${y0}V${y0 + h}`;
  for (let y = Math.ceil(y0 / step) * step; y <= y0 + h; y += step) d += `M${x0} ${y}H${x0 + w}`;
  return d;
}

/**
 * Wraps drawings in a blueprint sheet: paper colour, grid, border and a title
 * block. `views` are { segments, hidden?, label?, labels? } placed with their own
 * origin in studs; `labels` are { x, y, text } annotations in drawing space.
 */
export function blueprintSvg({ views, title, subtitle = "", note = "", width, height, scale = 6, grid = 8, lineWidth = 0.35, labelSize = 3.2, uiScale = 1 }) {
  const C = BLUEPRINT_COLORS;
  const parts = [];
  for (const v of views) {
    const g = [];
    if (v.hidden?.length) g.push(`<path d="${segmentsToPath(v.hidden)}" stroke="${C.hidden}" stroke-opacity="0.55" stroke-width="${lineWidth * 0.7}" stroke-dasharray="${lineWidth * 3} ${lineWidth * 3}" fill="none"/>`);
    g.push(`<path d="${segmentsToPath(v.segments)}" stroke="${C.line}" stroke-width="${lineWidth}" fill="none"/>`);
    for (const l of v.labels ?? []) g.push(`<text x="${l.x}" y="${l.y}" font-size="${l.size ?? labelSize}" fill="${l.color ?? C.text}" text-anchor="${l.anchor ?? "middle"}">${esc(l.text)}</text>`);
    for (const m of v.marks ?? []) g.push(m);
    if (v.label) g.push(`<text x="${v.labelAt?.[0] ?? 0}" y="${v.labelAt?.[1] ?? 0}" font-size="${labelSize * 1.15}" fill="${C.accent}" text-anchor="middle" letter-spacing="0.4">${esc(v.label)}</text>`);
    parts.push(`<g transform="translate(${v.at?.[0] ?? 0} ${v.at?.[1] ?? 0})">${g.join("")}</g>`);
  }
  const tb = { w: 70, h: 18 };
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width * scale}" height="${height * scale}" font-family="'Helvetica Neue', Arial, sans-serif">`,
    `<title>${esc(title)}</title>`,
    `<rect width="${width}" height="${height}" fill="${C.paper}"/>`,
    `<path d="${gridPath(0, 0, width, height, grid)}" stroke="${C.grid}" stroke-width="${0.1 * Math.max(1, uiScale / 2)}" fill="none"/>`,
    `<rect x="${3 * uiScale}" y="${3 * uiScale}" width="${width - 6 * uiScale}" height="${height - 6 * uiScale}" fill="none" stroke="${C.line}" stroke-width="${0.35 * uiScale}"/>`,
    ...parts,
    `<g transform="translate(${width - (tb.w + 3) * uiScale} ${height - (tb.h + 3) * uiScale}) scale(${uiScale})">`,
    `<rect width="${tb.w}" height="${tb.h}" fill="${C.paper}" stroke="${C.line}" stroke-width="0.35"/>`,
    `<text x="3" y="7" font-size="5" font-weight="700" fill="${C.line}">${esc(title)}</text>`,
    `<text x="3" y="12" font-size="2.6" fill="${C.text}">${esc(subtitle)}</text>`,
    `<text x="3" y="15.6" font-size="2.2" fill="${C.hidden}">${esc(note)}</text>`,
    `</g>`,
    `</svg>`,
  ].join("\n");
}
