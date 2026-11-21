import { describe, expect, it } from "vitest";
import { safeHref } from "./safe-href.js";

describe("safeHref", () => {
  it("allows relative paths, hashes, and mailto", () => {
    expect(safeHref("/blog")).toBe("/blog");
    expect(safeHref("#top")).toBe("#top");
    expect(safeHref("mailto:hey@hectormendoza.me")).toBe("mailto:hey@hectormendoza.me");
  });

  it("allows http(s) URLs", () => {
    expect(safeHref("https://example.com/a")).toBe("https://example.com/a");
    expect(safeHref("http://example.com")).toBe("http://example.com/");
  });

  it("blocks dangerous schemes", () => {
    expect(safeHref("javascript:alert(1)")).toBeNull();
    expect(safeHref("data:text/html,<script>alert(1)</script>")).toBeNull();
    expect(safeHref("vbscript:msgbox(1)")).toBeNull();
  });

  it("rejects empty or invalid values", () => {
    expect(safeHref("")).toBeNull();
    expect(safeHref("not a url")).toBeNull();
    expect(safeHref(null)).toBeNull();
  });
});
