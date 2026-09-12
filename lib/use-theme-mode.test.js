import { describe, expect, it } from "vitest";
import { projectSurface } from "./use-theme-mode";

describe("projectSurface", () => {
  it("prefers sage surfaces, then pastel, then the default", () => {
    expect(
      projectSurface({
        sageGradient: "from-sage",
        pastelGradient: "from-pastel",
        gradient: "from-default",
        sageAccent: "#111",
        accent: "#000",
      }),
    ).toEqual({ gradient: "from-sage", accent: "#111" });
  });
});
