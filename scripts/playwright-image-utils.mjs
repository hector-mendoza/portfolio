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

function nearRgb(a, b, tol = 18) {
  return (
    Math.abs(a[0] - b[0]) <= tol &&
    Math.abs(a[1] - b[1]) <= tol &&
    Math.abs(a[2] - b[2]) <= tol
  );
}

/** Background RGB behind text: opposite-luminance sample in a clip rect. */
export function backgroundPixelInRegion(png, clip, fgRgb, step = 2) {
  const { width, height, data } = png;
  const x0 = Math.max(0, Math.floor(clip.x));
  const y0 = Math.max(0, Math.floor(clip.y));
  const x1 = Math.min(width, Math.ceil(clip.x + clip.width));
  const y1 = Math.min(height, Math.ceil(clip.y + clip.height));
  if (x1 <= x0 || y1 <= y0) return null;
  const fgL = relLum(...fgRgb);
  const darkText = fgL < 0.45;
  let pick = null;
  let pickScore = darkText ? Infinity : -Infinity;
  for (let y = y0; y < y1; y += step) {
    for (let x = x0; x < x1; x += step) {
      const i = (width * y + x) << 2;
      const a = data[i + 3];
      if (a < 128) continue;
      const rgb = [data[i], data[i + 1], data[i + 2]];
      if (nearRgb(rgb, fgRgb, 22)) continue;
      const l = relLum(...rgb);
      if (darkText) {
        if (l <= fgL + 0.06) continue;
        if (l < pickScore) {
          pickScore = l;
          pick = rgb;
        }
      } else {
        if (l >= fgL - 0.06) continue;
        if (l > pickScore) {
          pickScore = l;
          pick = rgb;
        }
      }
    }
  }
  if (pick) return pick;
  return darkestPixelInRegion(png, clip, step, fgRgb);
}

/** Darkest RGB within a clip rect (viewport coordinates). */
export function darkestPixelInRegion(png, clip, step = 2, excludeRgb = null) {
  const { width, height, data } = png;
  const x0 = Math.max(0, Math.floor(clip.x));
  const y0 = Math.max(0, Math.floor(clip.y));
  const x1 = Math.min(width, Math.ceil(clip.x + clip.width));
  const y1 = Math.min(height, Math.ceil(clip.y + clip.height));
  if (x1 <= x0 || y1 <= y0) return null;
  let darkest = null;
  let darkestL = Infinity;
  for (let y = y0; y < y1; y += step) {
    for (let x = x0; x < x1; x += step) {
      const i = (width * y + x) << 2;
      const a = data[i + 3];
      if (a < 128) continue;
      const rgb = [data[i], data[i + 1], data[i + 2]];
      if (excludeRgb && nearRgb(rgb, excludeRgb)) continue;
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
