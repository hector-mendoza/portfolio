export const SAGE_AURORA_STOPS = ["#5fa97c", "#bfe8d0", "#7fbf98"];

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
