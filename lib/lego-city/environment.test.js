import { describe, expect, it } from "vitest";
import {
  LIVE_PLACE,
  formatClock,
  liveUrl,
  localHour,
  parseLive,
  phaseLabel,
  skyPhase,
  smoothstep,
  sunPosition,
  weatherFromLive,
  weatherKindFromCode,
} from "./environment.js";

// Morelia is UTC-6 all year (no DST since 2022): local 12:00 = 18:00Z
const at = (iso) => new Date(iso);

describe("sunPosition (Morelia)", () => {
  it("is high at local noon and below the horizon at local midnight", () => {
    expect(sunPosition(at("2026-10-19T18:45:00Z")).elevation).toBeGreaterThan(55);
    expect(sunPosition(at("2026-10-19T06:00:00Z")).elevation).toBeLessThan(-25);
  });

  it("rises and sets at plausible local times on 19 Oct", () => {
    expect(sunPosition(at("2026-10-19T12:00:00Z")).elevation).toBeLessThan(0); // 06:00 local
    expect(sunPosition(at("2026-10-19T13:30:00Z")).elevation).toBeGreaterThan(0); // 07:30 local
    expect(sunPosition(at("2026-10-19T23:30:00Z")).elevation).toBeGreaterThan(0); // 17:30 local
    expect(sunPosition(at("2026-10-20T01:30:00Z")).elevation).toBeLessThan(0); // 19:30 local
  });

  it("moves east to west across the day", () => {
    const morning = sunPosition(at("2026-10-19T14:00:00Z")).azimuth; // 08:00 local
    const evening = sunPosition(at("2026-10-19T23:00:00Z")).azimuth; // 17:00 local
    expect(morning).toBeGreaterThan(60);
    expect(morning).toBeLessThan(130);
    expect(evening).toBeGreaterThan(230);
    expect(evening).toBeLessThan(300);
  });
});

describe("skyPhase", () => {
  it("is monotonic in elevation and bounded", () => {
    let prev = -1;
    for (let e = -20; e <= 60; e += 2) {
      const { day, golden } = skyPhase(e);
      expect(day).toBeGreaterThanOrEqual(prev);
      expect(day).toBeLessThanOrEqual(1);
      expect(golden).toBeGreaterThanOrEqual(0);
      expect(golden).toBeLessThanOrEqual(1);
      prev = day;
    }
    expect(skyPhase(-30).day).toBe(0);
    expect(skyPhase(50).day).toBe(1);
  });

  it("glows warm only near the horizon", () => {
    expect(skyPhase(2).golden).toBeGreaterThan(0.8);
    expect(skyPhase(45).golden).toBe(0);
    expect(skyPhase(-20).golden).toBe(0);
  });

  it("labels the phases", () => {
    expect(phaseLabel(40, 13)).toBe("Day");
    expect(phaseLabel(2, 7)).toBe("Sunrise");
    expect(phaseLabel(2, 18)).toBe("Sunset");
    expect(phaseLabel(-30, 1)).toBe("Night");
  });
});

describe("weather mapping", () => {
  it("maps WMO codes to kinds", () => {
    const cases = { 0: "clear", 1: "clear", 2: "cloudy", 3: "cloudy", 45: "fog", 51: "drizzle", 61: "rain", 65: "rain", 80: "rain", 71: "snow", 86: "snow", 95: "storm", 99: "storm" };
    for (const [code, kind] of Object.entries(cases)) expect(weatherKindFromCode(Number(code))).toBe(kind);
    expect(weatherKindFromCode(undefined)).toBe("clear");
    expect(weatherKindFromCode(Number.NaN)).toBe("clear");
  });

  it("uses measured cloud cover for clear and cloudy skies only", () => {
    expect(weatherFromLive({ code: 0, cloud: 100 }).cloud).toBeGreaterThan(0.5);
    expect(weatherFromLive({ code: 0, cloud: 0 }).cloud).toBeLessThan(0.15);
    expect(weatherFromLive({ code: 63, cloud: 10 }).cloud).toBeGreaterThan(0.9);
  });

  it("parses the Open-Meteo payload and rejects junk", () => {
    expect(parseLive({ current: { weather_code: 61, temperature_2m: 17.2, cloud_cover: 90, wind_speed_10m: 8 } })).toEqual({ code: 61, temp: 17.2, cloud: 90, wind: 8 });
    expect(parseLive({})).toBeNull();
    expect(parseLive(null)).toBeNull();
    expect(parseLive({ current: { weather_code: "x" } })).toBeNull();
  });

  it("builds a keyless request for the live place", () => {
    const url = new URL(liveUrl());
    expect(url.hostname).toBe("api.open-meteo.com");
    expect(url.searchParams.get("latitude")).toBe(String(LIVE_PLACE.latitude));
    expect(url.searchParams.get("current")).toContain("weather_code");
    expect(url.searchParams.get("apikey")).toBeNull();
  });
});

describe("clock", () => {
  it("formats Morelia time", () => {
    expect(formatClock(at("2026-10-19T18:45:00Z"))).toMatch(/12:45\s?PM/);
    expect(localHour(at("2026-10-19T18:45:00Z"))).toBe(12);
    expect(localHour(at("2026-10-19T06:10:00Z"))).toBe(0);
  });

  it("smoothstep clamps", () => {
    expect(smoothstep(0, 1, -1)).toBe(0);
    expect(smoothstep(0, 1, 2)).toBe(1);
    expect(smoothstep(0, 1, 0.5)).toBeCloseTo(0.5, 5);
  });
});
