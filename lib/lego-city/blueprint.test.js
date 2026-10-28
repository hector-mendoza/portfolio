import { describe, expect, it } from "vitest";
import { blueprintSvg, cleanSegments, segmentBounds, segmentsToPath } from "./blueprint.js";

describe("blueprint helpers", () => {
  it("rounds, drops degenerate segments and removes duplicates in either direction", () => {
    const out = cleanSegments([[0, 0, 1, 0], [1, 0, 0, 0], [2, 2, 2.01, 2.01], [0.04, 0, 1, 0.02]], 1);
    expect(out).toEqual([[0, 0, 1, 0]]);
  });

  it("measures the bounds of a set of segments", () => {
    expect(segmentBounds([[0, 1, 4, 2], [-2, 5, 1, 3]])).toEqual({ x0: -2, y0: 1, x1: 4, y1: 5, w: 6, h: 4 });
  });

  it("chains connected segments into one subpath and starts a new one at a gap", () => {
    const d = segmentsToPath([[0, 0, 1, 0], [1, 0, 1, 1], [5, 5, 6, 5]]);
    expect(d).toBe("M0 0L1 0L1 1M5 5L6 5");
  });

  it("applies a coordinate map (for example flipping y)", () => {
    expect(segmentsToPath([[0, 0, 2, 3]], (x, y) => [x + 10, 20 - y])).toBe("M10 20L12 17");
  });

  it("builds a well-formed sheet with a title block and escapes text", () => {
    const svg = blueprintSvg({
      views: [{ segments: [[0, 0, 10, 0]], hidden: [[0, 1, 10, 1]], at: [5, 5], label: "FRONT", labelAt: [5, -2], labels: [{ x: 1, y: 1, text: "A & B <c>" }] }],
      title: "Test",
      subtitle: "Plan",
      width: 100,
      height: 60,
    });
    expect(svg.startsWith("<svg")).toBe(true);
    expect(svg.trim().endsWith("</svg>")).toBe(true);
    expect(svg).toContain("A &amp; B &lt;c&gt;");
    expect(svg).toContain("stroke-dasharray"); // the hidden lines
    expect(svg).toContain(">Test<");
  });
});
