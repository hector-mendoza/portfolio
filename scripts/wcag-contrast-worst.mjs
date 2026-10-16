import { chromium } from "playwright";
import {
  contrastRatio,
  darkestPixel,
  decodePng,
  mergeDarkest,
} from "./playwright-image-utils.mjs";

const ORIGIN = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const ANIMATION_MS = Number(process.env.CONTRAST_ANIMATION_MS ?? "5000");
const SAMPLE_INTERVAL_MS = Number(process.env.CONTRAST_SAMPLE_MS ?? "200");
const MIN_RATIO = 4.5;

function parseRgb(color) {
  const m = color.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const parts = m[1].split(",").map((s) => parseFloat(s.trim()));
  if (parts.length < 3) return null;
  return parts.slice(0, 3);
}

async function isSecondaryGreyText(locator) {
  return locator.evaluate((el) => {
    function parseRgb(color) {
      const m = color.match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const parts = m[1].split(",").map((s) => parseFloat(s.trim()));
      if (parts.length < 3) return null;
      return parts.slice(0, 3);
    }
    function hexToRgb(hex) {
      const m = hex.trim().match(/^#([0-9a-f]{6})$/i);
      if (!m) return null;
      const n = parseInt(m[1], 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }
    function nearRgb(a, b, tol = 10) {
      return (
        Math.abs(a[0] - b[0]) <= tol &&
        Math.abs(a[1] - b[1]) <= tol &&
        Math.abs(a[2] - b[2]) <= tol
      );
    }
    const ui = el.closest("[data-portfolio-ui]");
    if (!ui) return null;
    const style = getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden") return null;
    const text = (el.textContent ?? "").trim();
    if (text.length < 2) return null;
    if (el.querySelector("p, span, a, h1, h2, h3")) return null;
    const uiStyle = getComputedStyle(ui);
    const ink = hexToRgb(uiStyle.getPropertyValue("--ink").trim()) ?? [5, 5, 5];
    const secondary =
      hexToRgb(uiStyle.getPropertyValue("--fg-secondary").trim()) ??
      hexToRgb(uiStyle.getPropertyValue("--muted").trim()) ?? [24, 24, 24];
    const fg = parseRgb(style.color);
    if (!fg || nearRgb(fg, ink) || !nearRgb(fg, secondary, 14)) return null;
    return {
      tag: el.tagName.toLowerCase(),
      className: el.className?.toString?.().slice(0, 80) ?? "",
      color: style.color,
      text: text.slice(0, 72),
    };
  });
}

async function main() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--enable-webgl", "--use-gl=angle", "--use-angle=swiftshader-webgl"],
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`${ORIGIN}/`, { waitUntil: "load" });
  await page.waitForFunction(
    () => document.documentElement.getAttribute("data-scene") === "living",
    { timeout: 25000 }
  );
  await page.waitForTimeout(3000);

  const candidates = page.locator(
    "[data-portfolio-ui] p, [data-portfolio-ui] span, [data-portfolio-ui] a, [data-portfolio-ui] h3, [data-portfolio-ui] em, [data-portfolio-ui] small, [data-portfolio-ui] li, [data-portfolio-ui] label, [data-portfolio-ui] code"
  );
  const count = await candidates.count();
  const items = [];
  for (let i = 0; i < count; i++) {
    const loc = candidates.nth(i);
    const meta = await isSecondaryGreyText(loc);
    if (!meta) continue;
    await loc.scrollIntoViewIfNeeded();
    items.push({ loc, meta, darkest: null });
  }

  const started = Date.now();
  let step = 0;
  while (Date.now() - started < ANIMATION_MS) {
    await page.mouse.move(140 + (step % 11) * 34, 260 + (step % 9) * 26);
    await page.waitForTimeout(SAMPLE_INTERVAL_MS);
    for (const item of items) {
      const clip = await item.loc.boundingBox();
      if (!clip || clip.width < 2 || clip.height < 2) continue;
      const png = decodePng(
        await page.screenshot({ type: "png", clip, animations: "disabled" })
      );
      item.darkest = mergeDarkest(item.darkest, darkestPixel(png));
    }
    step += 1;
  }

  const ranked = [];
  for (const item of items) {
    const fg = parseRgb(item.meta.color);
    if (!item.darkest || !fg) continue;
    ranked.push({
      ratio: Math.round(contrastRatio(fg, item.darkest) * 100) / 100,
      tag: item.meta.tag,
      className: item.meta.className,
      color: item.meta.color,
      text: item.meta.text,
      darkestScreenshotPixelRgb: [...item.darkest],
    });
  }
  ranked.sort((a, b) => a.ratio - b.ratio);
  const worst = ranked[0];
  const fgSecondary = await page.evaluate(() =>
    getComputedStyle(document.querySelector("[data-portfolio-ui]"))
      .getPropertyValue("--fg-secondary")
      .trim()
  );

  const result = {
    greyElements: items.length,
    elementsMeasured: ranked.length,
    worstElement: worst ?? null,
    heroSublineWorstCase:
      ranked.find((row) => row.text.includes("Product engineering")) ?? null,
    fgSecondaryToken: fgSecondary || "(unset)",
    animationWindowMs: ANIMATION_MS,
    sampleIntervalMs: SAMPLE_INTERVAL_MS,
    minRatio: MIN_RATIO,
  };

  console.log(JSON.stringify(result, null, 2));
  if (!worst) {
    console.error("No contrast measurements captured");
    process.exit(1);
  }
  if (worst.ratio < MIN_RATIO) {
    console.error(`Worst contrast ${worst.ratio} < ${MIN_RATIO}`);
    process.exit(1);
  }
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
