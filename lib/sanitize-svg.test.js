import { describe, expect, it } from "vitest";
import { sanitizeSvgMarkup } from "./sanitize-svg.js";

describe("sanitizeSvgMarkup", () => {
  it("strips script tags and event handlers", () => {
    const dirty =
      '<svg><script>alert(1)</script><path onclick="evil()" d="M0 0"/><a href="javascript:alert(1)"></a></svg>';
    const clean = sanitizeSvgMarkup(dirty);
    expect(clean).not.toMatch(/script/i);
    expect(clean).not.toMatch(/onclick/i);
    expect(clean).not.toMatch(/javascript:/i);
    expect(clean).toContain('pathLength="1"');
  });

  it("returns empty string for invalid input", () => {
    expect(sanitizeSvgMarkup("")).toBe("");
    expect(sanitizeSvgMarkup(null)).toBe("");
  });
});
