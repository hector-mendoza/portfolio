import { describe, expect, it } from "vitest";
import { SAGE_AURORA_STOPS, cssVarToColor } from "./aurora-stops";

describe("SAGE_AURORA_STOPS", () => {
  it("uses mint stops for the production palette", () => {
    expect(SAGE_AURORA_STOPS[1]).toBe("#bfe8d0");
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
