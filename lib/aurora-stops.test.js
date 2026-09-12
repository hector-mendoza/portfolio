import { describe, expect, it } from "vitest";
import { auroraStopsForTheme, cssVarToColor } from "./aurora-stops";

describe("auroraStopsForTheme", () => {
  it("returns sage mint for the sage palette", () => {
    expect(auroraStopsForTheme("sage")[1]).toBe("#bfe8d0");
  });

  it("falls back to sage for unknown palettes", () => {
    expect(auroraStopsForTheme("unknown")).toEqual(auroraStopsForTheme("sage"));
  });
});

describe("cssVarToColor", () => {
  it("wraps space-separated HSL channels", () => {
    expect(cssVarToColor("145 30% 40%")).toBe("hsl(145 30% 40%)");
  });

  it("passes through hex and hsl values", () => {
    expect(cssVarToColor("#fff")).toBe("#fff");
    expect(cssVarToColor("hsl(0 0% 100%)")).toBe("hsl(0 0% 100%)");
  });

  it("uses the fallback for empty values", () => {
    expect(cssVarToColor("")).toBe("#ffffff");
  });
});
