import { chromium } from "playwright";

const ORIGIN = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

async function main() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--enable-webgl", "--use-gl=angle", "--use-angle=swiftshader-webgl"],
  });
  const page = await browser.newPage();
  await page.goto(`${ORIGIN}/`, { waitUntil: "load" });
  await page.waitForFunction(
    () => document.documentElement.getAttribute("data-scene") === "living",
    { timeout: 25000 }
  );
  await page.waitForTimeout(4000);

  const result = await page.evaluate(() => {
    function relLum(r, g, b) {
      const f = (c) => {
        const s = c / 255;
        return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    }

    function contrast(fg, bg) {
      const l1 = relLum(...fg);
      const l2 = relLum(...bg);
      const lighter = Math.max(l1, l2);
      const darker = Math.min(l1, l2);
      return (lighter + 0.05) / (darker + 0.05);
    }

    const canvas = document.querySelector("canvas");
    if (!canvas) return { error: "no canvas" };
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    if (!gl) return { error: "no webgl" };

    const w = canvas.width;
    const h = canvas.height;
    const step = 16;
    let darkest = [247, 247, 245];
    let darkestL = 1;
    const buf = new Uint8Array(4);
    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        gl.readPixels(x, h - 1 - y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, buf);
        if (buf[3] < 128) continue;
        const px = [buf[0], buf[1], buf[2]];
        const l = relLum(...px);
        if (l < 0.08) continue;
        if (l < darkestL) {
          darkestL = l;
          darkest = px;
        }
      }
    }

    const uiRoot =
      document.querySelector("[data-section='hero']") ??
      document.querySelector("#top");
    const candidates = [
      ...uiRoot.querySelectorAll("p, span, a, h1, h2, h3, em, small"),
    ];
    let worst = { ratio: 999, tag: "", className: "", color: "", text: "" };

    for (const el of candidates) {
      const style = getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden") continue;
      const text = (el.textContent ?? "").trim();
      if (text.length < 2) continue;
      const m = style.color.match(/rgba?\(([^)]+)\)/);
      if (!m) continue;
      const parts = m[1].split(",").map((s) => parseFloat(s.trim()));
      if (parts.length < 3) continue;
      const fg = parts.slice(0, 3);
      const ratio = contrast(fg, darkest);
      if (ratio < worst.ratio) {
        worst = {
          ratio: Math.round(ratio * 100) / 100,
          tag: el.tagName.toLowerCase(),
          className: el.className?.toString?.().slice(0, 80) ?? "",
          color: style.color,
          text: text.slice(0, 56),
        };
      }
    }

    return { darkest, darkestL: Math.round(darkestL * 1000) / 1000, worst, count: candidates.length };
  });

  if (result.error) {
    console.error(result.error);
    process.exit(1);
  }

  console.log(
    JSON.stringify(
      {
        darkestCanvasPixelRgb: result.darkest,
        darkestCanvasRelativeLuminance: result.darkestL,
        elementsScanned: result.count,
        worstElement: result.worst,
        fgSecondaryToken: "#3c3c3c (--fg-secondary on [data-portfolio-ui])",
      },
      null,
      2
    )
  );

  if (result.worst.ratio < 4.5) {
    console.error(`Worst contrast ${result.worst.ratio} < 4.5`);
    process.exit(1);
  }
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
