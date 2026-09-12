export const AURORA_COLOR_STOPS = {
  sage: ["#86c9a3", "#d7f3e4", "#6fb892"],
  mist: ["#9ec5e8", "#dbe7f8", "#8ab0d4"],
  obsidian: ["#e8c4b8", "#f0d9ce", "#c9a196"],
  velvet: ["#e8b8c0", "#f4dce0", "#d49aa6"],
  ember: ["#efc4a8", "#f6e0cc", "#e0a882"],
  noir: ["#d6d0c8", "#eeeae4", "#b8b2aa"],
};

export function auroraStopsForTheme(theme) {
  return AURORA_COLOR_STOPS[theme] || AURORA_COLOR_STOPS.sage;
}

export function cssVarToColor(value, fallback = "#ffffff") {
  const raw = String(value ?? "").trim();
  if (!raw) return fallback;
  if (
    raw.startsWith("#") ||
    raw.startsWith("rgb") ||
    raw.startsWith("hsl") ||
    raw.startsWith("oklch")
  ) {
    return raw;
  }
  return `hsl(${raw})`;
}
