/**
 * LEGO® colour palette (BrickLink names → sRGB hex).
 * Shared by the Three.js runtime and the Blender exporter via city-parts.json.
 */
export const PALETTE = {
  white: "#F4F4F4",
  black: "#1B2A34",
  "bright-red": "#C91A09",
  "dark-red": "#720E0F",
  "bright-blue": "#0055BF",
  "dark-blue": "#0A3463",
  "dark-azure": "#078BC9",
  "medium-azure": "#36AEBF",
  "bright-yellow": "#F2CD37",
  "bright-light-orange": "#F8BB3D",
  orange: "#FE8A18",
  "dark-orange": "#A95500",
  "bright-green": "#4B9F4A",
  green: "#237841",
  "dark-green": "#184632",
  lime: "#BBE90B",
  "sand-green": "#A0BCAC",
  magenta: "#923978",
  "dark-pink": "#C870A0",
  "bright-pink": "#E4ADC8",
  "dark-purple": "#3F3691",
  lavender: "#E1D5ED",
  tan: "#E4CD9E",
  "dark-tan": "#958A73",
  "medium-nougat": "#AA7D55",
  "reddish-brown": "#582A12",
  "light-bluish-gray": "#A0A5A9",
  "dark-bluish-gray": "#6C6E68",
  "trans-clear": "#D9EEF5",
  "trans-light-blue": "#AEEFEC",
  "trans-yellow": "#F5CD2F",
  "trans-red": "#E04A3C",
  "chrome-silver": "#C8CCCF",
  "pearl-gold": "#AA7F2E",
};

export const PALETTE_NAMES = Object.keys(PALETTE);

export function colorHex(name) {
  const hex = PALETTE[name];
  if (!hex) throw new Error(`Unknown LEGO colour "${name}"`);
  return hex;
}

/** Finishes map to material presets in both renderers. */
export const FINISHES = ["plastic", "glass", "chrome", "matte"];

export function finishFor(colorName) {
  if (colorName.startsWith("trans-")) return "glass";
  if (colorName.startsWith("chrome") || colorName.startsWith("pearl")) return "chrome";
  return "plastic";
}
