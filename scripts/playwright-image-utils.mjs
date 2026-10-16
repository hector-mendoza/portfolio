import { PNG } from "pngjs";

export function decodePng(buffer) {
  return PNG.sync.read(buffer);
}

export function relLum(r, g, b) {
  const f = (c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

export function mergeDarkest(current, next) {
  if (!next) return current;
  if (!current) return next;
  return relLum(...next) < relLum(...current) ? next : current;
}

export function contrastRatio(fg, bg) {
  const l1 = relLum(...fg);
  const l2 = relLum(...bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Darkest RGB in PNG data (full opacity pixels only). */
export function darkestPixel(png, step = 2) {
  const { width, height, data } = png;
  let darkest = null;
  let darkestL = Infinity;
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const i = (width * y + x) << 2;
      const a = data[i + 3];
      if (a < 128) continue;
      const rgb = [data[i], data[i + 1], data[i + 2]];
      const l = relLum(...rgb);
      if (l < darkestL) {
        darkestL = l;
        darkest = rgb;
      }
    }
  }
  return darkest;
}

export function countChangedPixels(pngA, pngB, tolerance = 2) {
  if (pngA.width !== pngB.width || pngA.height !== pngB.height) return -1;
  const { width, height, data: a } = pngA;
  const b = pngB.data;
  let changed = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (width * y + x) << 2;
      if (
        Math.abs(a[i] - b[i]) > tolerance ||
        Math.abs(a[i + 1] - b[i + 1]) > tolerance ||
        Math.abs(a[i + 2] - b[i + 2]) > tolerance ||
        Math.abs(a[i + 3] - b[i + 3]) > tolerance
      ) {
        changed += 1;
      }
    }
  }
  return changed;
}
