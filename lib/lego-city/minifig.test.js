import { describe, expect, it } from "vitest";
import { MINIFIG_HEIGHT, minifig } from "./builders.js";
import { Parts } from "./parts.js";
import { PALETTE } from "./palette.js";

const build = (opts) => {
  const p = new Parts();
  minifig(p, opts);
  return p.items;
};
const top = (items) => Math.max(...items.map((i) => i.y + (i.t === "cyl" && i.axis && i.axis !== "y" ? i.r : (i.h ?? 0))));

describe("minifig", () => {
  it("keeps its feet on the ground and stays within the declared height", () => {
    const items = build({});
    expect(Math.min(...items.map((i) => (i.t === "cyl" && i.axis && i.axis !== "y" ? i.y - i.r : i.y)))).toBeCloseTo(0, 5);
    expect(top(items)).toBeLessThanOrEqual(MINIFIG_HEIGHT + 0.6);
    expect(top(items)).toBeGreaterThan(MINIFIG_HEIGHT - 0.5);
  });

  it("tags the limbs the runtime swings, plus the head", () => {
    const parts = new Set(build({}).map((i) => i.part));
    for (const name of ["leftLeg", "rightLeg", "leftArm", "rightArm", "head", "torso", "hips"]) expect(parts.has(name)).toBe(true);
  });

  it("prints a face on the front (-z) side of the head", () => {
    const faceDots = build({}).filter((i) => i.part === "head" && i.t === "cyl" && i.axis === "z");
    expect(faceDots.length).toBeGreaterThanOrEqual(10); // two eyes (2 dots each) and the smile
    for (const d of faceDots) expect(d.z).toBeLessThan(-0.5);
  });

  it("builds every style combination from palette colours with finite numbers", () => {
    const styles = [];
    for (const hairStyle of ["short", "long", "ponytail", "messy", "bald"])
      for (const face of ["smile", "grin", "wink", "surprised", "glasses"])
        for (const print of ["plain", "buttons", "tie", "stripes", "jacket"]) styles.push({ hairStyle, face, print, accessory: face === "wink" ? "scarf" : "backpack" });
    for (const hatStyle of ["cap", "hard", "top", "beanie"]) styles.push({ hat: "bright-red", hatStyle, hairStyle: "long" });
    for (const opts of styles) {
      for (const item of build({ torso: "lime", ...opts })) {
        expect(PALETTE[item.c]).toBeDefined();
        for (const k of ["x", "y", "z", "w", "h", "d", "r"]) if (item[k] !== undefined) expect(Number.isFinite(item[k])).toBe(true);
      }
    }
  });

  it("changes what is printed when the print option changes", () => {
    expect(build({ print: "tie" }).length).not.toBe(build({ print: "plain" }).length);
    expect(build({ face: "glasses" }).length).toBeGreaterThan(build({ face: "smile" }).length);
  });
});
