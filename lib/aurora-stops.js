export const AURORA_COLOR_STOPS = {
  sage: ["#14532d", "#34d399", "#0f172a"],
  mist: ["#1e3a5f", "#7dd3fc", "#1e1b4b"],
  obsidian: ["#4B262F", "#e8b4a8", "#1c1412"],
  velvet: ["#6b2d3c", "#f0c4bc", "#2a1218"],
  ember: ["#7c2d12", "#f59e0b", "#1c1917"],
  noir: ["#292524", "#d6d3d1", "#0c0a09"],
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
