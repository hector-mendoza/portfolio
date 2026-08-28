/** Portfolio brand colors as linear RGB (for WebGPU / vgpu LED tints). */

export interface LinearRgb {
  r: number;
  g: number;
  b: number;
}

function hslToSrgb(h: number, s: number, l: number) {
  const sat = s / 100;
  const light = l / 100;
  const c = (1 - Math.abs(2 * light - 1)) * sat;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = light - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) {
    r = c; g = x; b = 0;
  } else if (h < 120) {
    r = x; g = c; b = 0;
  } else if (h < 180) {
    r = 0; g = c; b = x;
  } else if (h < 240) {
    r = 0; g = x; b = c;
  } else if (h < 300) {
    r = x; g = 0; b = c;
  } else {
    r = c; g = 0; b = x;
  }
  return { r: r + m, g: g + m, b: b + m };
}

function srgbToLinear(channel: number) {
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

export function hslToLinearRgb(h: number, s: number, l: number): LinearRgb {
  const { r, g, b } = hslToSrgb(h, s, l);
  return {
    r: srgbToLinear(r),
    g: srgbToLinear(g),
    b: srgbToLinear(b),
  };
}

/** Dark theme tokens from globals.css */
export const BRAND_PRIMARY_LINEAR = hslToLinearRgb(168, 45, 42);
export const BRAND_ACCENT_LINEAR = hslToLinearRgb(205, 50, 52);
export const BRAND_CYAN_LINEAR = hslToLinearRgb(195, 40, 58);

/** Triangle LED edge colors mapped to brand palette */
export const BRAND_LED_EDGES = {
  edgeRedLinear: BRAND_PRIMARY_LINEAR,
  edgeGreenLinear: BRAND_ACCENT_LINEAR,
  edgeBlueLinear: BRAND_CYAN_LINEAR,
} as const;
