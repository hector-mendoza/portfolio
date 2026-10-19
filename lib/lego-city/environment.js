/**
 * Pure helpers for the live sky: where the sun is, what the weather code
 * means, and how to blend them into scene parameters. No renderer imports,
 * so it is unit-tested and also usable from Node.
 */

/** Pilleland's real-world twin. Change these to follow another place. */
export const LIVE_PLACE = {
  name: "Morelia",
  latitude: 19.706,
  longitude: -101.195,
  timeZone: "America/Mexico_City",
};

const RAD = Math.PI / 180;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const smoothstep = (a, b, v) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
export const lerp = (a, b, t) => a + (b - a) * t;

/**
 * Solar elevation and azimuth in degrees (azimuth clockwise from north) for a
 * Date at a latitude/longitude. NOAA's low-precision algorithm: good to a
 * fraction of a degree, which is plenty for a LEGO sky.
 */
export function sunPosition(date, latitude = LIVE_PLACE.latitude, longitude = LIVE_PLACE.longitude) {
  const ms = date.getTime();
  const jd = ms / 86400000 + 2440587.5;
  const n = jd - 2451545.0;
  const L = (280.46 + 0.9856474 * n) % 360;
  const g = ((357.528 + 0.9856003 * n) % 360) * RAD;
  const lambda = (L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * RAD;
  const epsilon = (23.439 - 0.0000004 * n) * RAD;
  const ra = Math.atan2(Math.cos(epsilon) * Math.sin(lambda), Math.cos(lambda));
  const dec = Math.asin(Math.sin(epsilon) * Math.sin(lambda));
  const gmst = (280.46061837 + 360.98564736629 * n) % 360;
  const lst = ((gmst + longitude) % 360) * RAD;
  const ha = lst - ra;
  const lat = latitude * RAD;
  const elevation = Math.asin(Math.sin(lat) * Math.sin(dec) + Math.cos(lat) * Math.cos(dec) * Math.cos(ha));
  const azimuth = Math.atan2(-Math.sin(ha) * Math.cos(dec), Math.cos(lat) * Math.sin(dec) - Math.sin(lat) * Math.cos(dec) * Math.cos(ha));
  return { elevation: elevation / RAD, azimuth: (azimuth / RAD + 360) % 360 };
}

/** Time-of-day presets used by the manual selector. */
export const TIME_PRESETS = {
  day: { elevation: 52, azimuth: 205 },
  dusk: { elevation: 3, azimuth: 262 },
  night: { elevation: -35, azimuth: 205 },
};

/**
 * Sky phase from solar elevation. `day` is 0 at night and 1 in full daylight,
 * `golden` peaks near the horizon (sunrise and sunset glow).
 */
export function skyPhase(elevation) {
  const day = smoothstep(-7, 9, elevation);
  const golden = smoothstep(-5, 1, elevation) * (1 - smoothstep(6, 22, elevation));
  return { day, golden };
}

export function phaseLabel(elevation, hour) {
  if (elevation > 12) return "Day";
  if (elevation > -4) return hour < 12 ? "Sunrise" : "Sunset";
  return "Night";
}

/** WMO weather codes (Open-Meteo) to a kind plus scene intensities. */
export const WEATHER_KINDS = {
  clear: { label: "Clear", cloud: 0.12, rain: 0, snow: 0, fog: 0, storm: 0 },
  cloudy: { label: "Cloudy", cloud: 0.85, rain: 0, snow: 0, fog: 0.05, storm: 0 },
  fog: { label: "Fog", cloud: 0.65, rain: 0, snow: 0, fog: 0.9, storm: 0 },
  drizzle: { label: "Drizzle", cloud: 0.85, rain: 0.35, snow: 0, fog: 0.2, storm: 0 },
  rain: { label: "Rain", cloud: 0.95, rain: 0.9, snow: 0, fog: 0.25, storm: 0 },
  snow: { label: "Snow", cloud: 0.85, rain: 0, snow: 0.9, fog: 0.35, storm: 0 },
  storm: { label: "Storm", cloud: 1, rain: 1, snow: 0, fog: 0.3, storm: 1 },
};

export const WEATHER_ORDER = ["clear", "cloudy", "fog", "rain", "storm", "snow"];

export function weatherKindFromCode(code) {
  if (code === undefined || code === null || Number.isNaN(code)) return "clear";
  if (code === 0 || code === 1) return "clear";
  if (code === 2 || code === 3) return "cloudy";
  if (code === 45 || code === 48) return "fog";
  if (code >= 51 && code <= 57) return "drizzle";
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return "rain";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "snow";
  if (code >= 95) return "storm";
  return "cloudy";
}

/** Blends the kind's cloud amount with the measured cloud cover when we have it. */
export function weatherFromLive(live) {
  const kind = weatherKindFromCode(live?.code);
  const base = WEATHER_KINDS[kind];
  const cover = typeof live?.cloud === "number" ? clamp(live.cloud / 100) : base.cloud;
  return { kind, ...base, cloud: kind === "clear" || kind === "cloudy" ? lerp(base.cloud, cover, 0.6) : base.cloud };
}

export function formatClock(date, timeZone = LIVE_PLACE.timeZone) {
  try {
    return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone }).format(date);
  } catch {
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }
}

export function localHour(date, timeZone = LIVE_PLACE.timeZone) {
  try {
    return Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hour12: false, timeZone }).format(date)) % 24;
  } catch {
    return date.getHours();
  }
}

export function liveUrl(place = LIVE_PLACE) {
  const q = new URLSearchParams({
    latitude: String(place.latitude),
    longitude: String(place.longitude),
    current: "temperature_2m,weather_code,cloud_cover,wind_speed_10m",
    timezone: place.timeZone,
  });
  return `https://api.open-meteo.com/v1/forecast?${q}`;
}

export function parseLive(json) {
  const c = json?.current;
  if (!c || typeof c.weather_code !== "number") return null;
  return { code: c.weather_code, temp: c.temperature_2m, cloud: c.cloud_cover, wind: c.wind_speed_10m };
}
