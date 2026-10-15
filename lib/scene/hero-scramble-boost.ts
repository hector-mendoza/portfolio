/** WCAG caps mirrored from gradient-ascii-renderer (do not raise globally). */
const WCAG_GRADIENT_OPACITY_MAX = 0.32;
const WCAG_GLYPH_OPACITY_MAX = 0.4;

const INK = "#050505";
const PAPER = "#f7f7f5";

function relativeLuminance(hex: string): number {
  const n = hex.replace("#", "");
  const r = parseInt(n.slice(0, 2), 16) / 255;
  const g = parseInt(n.slice(2, 4), 16) / 255;
  const b = parseInt(n.slice(4, 6), 16) / 255;
  const lin = (c: number) =>
    c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  const [lr, lg, lb] = [lin(r), lin(g), lin(b)];
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

function contrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Worst-case bg luminance under pointer scramble (localized glyph churn). */
function worstBackgroundLuminance(scrambleBoost: number): number {
  const paperL = relativeLuminance(PAPER);
  const gradientLift = WCAG_GRADIENT_OPACITY_MAX * 0.35;
  const scrambleDarken =
    scrambleBoost * WCAG_GLYPH_OPACITY_MAX * 0.28 * relativeLuminance(INK);
  return Math.max(
    relativeLuminance(INK),
    paperL + gradientLift - scrambleDarken
  );
}

/**
 * Largest hero-only scramble boost that keeps #050505 headline/body above
 * WCAG vs the brightest localized frame (3:1 large, 4.5:1 body).
 */
export function resolveHeroPointerScrambleBoost(): number {
  const inkL = relativeLuminance(INK);
  let boost = 1;
  while (boost > 0.05) {
    const bgL = worstBackgroundLuminance(boost);
    const ratio = contrastRatio(inkL, bgL);
    if (ratio >= 4.5) return Math.round(boost * 100) / 100;
    boost -= 0.02;
  }
  return 0.05;
}

export const HERO_POINTER_SCRAMBLE_RADIUS_PX = 120;
export const HERO_POINTER_SCRAMBLE_BOOST = resolveHeroPointerScrambleBoost();
