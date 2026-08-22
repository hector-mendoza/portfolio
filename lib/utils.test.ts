import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("px-2 py-1", "text-sm")).toBe("px-2 py-1 text-sm");
  });

  it("resolves conflicting tailwind classes with the last one winning", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("drops falsy values", () => {
    expect(cn("px-2", false && "hidden", undefined, "text-sm")).toBe(
      "px-2 text-sm",
    );
  });
});
