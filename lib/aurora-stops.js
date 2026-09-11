export const AURORA_COLOR_STOPS = {
  sage: ["#34d399", "#a7f3d0", "#22c55e"],
  mist: ["#38bdf8", "#c4b5fd", "#60a5fa"],
  obsidian: ["#f0c4bc", "#e11d48", "#f59e0b"],
  velvet: ["#fb7185", "#f0c4bc", "#e11d48"],
  ember: ["#fb923c", "#f59e0b", "#f43f5e"],
  noir: ["#e7e5e4", "#a8a29e", "#f43f5e"],
};

export function auroraStopsForTheme(theme) {
  return AURORA_COLOR_STOPS[theme] || AURORA_COLOR_STOPS.obsidian;
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
