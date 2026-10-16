import { chromium } from "playwright";
import {
  contrastRatio,
  backgroundPixelInRegion,
  darkestPixelInRegion,
  decodePng,
  mergeDarkest,
} from "./playwright-image-utils.mjs";

const ORIGIN = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const ANIMATION_MS = Number(process.env.CONTRAST_ANIMATION_MS ?? "5000");
const SAMPLE_INTERVAL_MS = Number(process.env.CONTRAST_SAMPLE_MS ?? "200");
const MIN_RATIO = 4.5;

function backdropClips(clip) {
  const h = Math.max(4, Math.min(10, clip.height * 0.22));
  const below = {
    x: clip.x,
    y: clip.y + clip.height + 1,
    width: clip.width,
    height: h,
  };
  const above = {
    x: clip.x,
    y: Math.max(0, clip.y - h - 1),
    width: clip.width,
    height: h,
  };
  return [below, above];
}

function parseRgb(color) {
  const m = color.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const parts = m[1].split(",").map((s) => parseFloat(s.trim()));
  if (parts.length < 3) return null;
  return parts.slice(0, 3);
}

async function collectSecondaryGreyItems(page) {
  return page.evaluate(() => {
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
    const ui = document.querySelector("[data-portfolio-ui]");
    if (!ui) return [];
    const uiStyle = getComputedStyle(ui);
    const ink = hexToRgb(uiStyle.getPropertyValue("--ink").trim()) ?? [5, 5, 5];
    const secondary =
      hexToRgb(uiStyle.getPropertyValue("--fg-secondary").trim()) ??
      hexToRgb(uiStyle.getPropertyValue("--muted").trim()) ?? [24, 24, 24];
    const nodes = ui.querySelectorAll(
      "p, span, a, h3, em, small, li, label, code"
    );
    const matched = [];
    for (const el of nodes) {
      const style = getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden") continue;
      const text = (el.textContent ?? "").trim();
      if (text.length < 2) continue;
      if (el.querySelector("p, span, a, h1, h2, h3")) continue;
      const fg = parseRgb(style.color);
      if (!fg || nearRgb(fg, ink)) continue;
      const fgL =
        0.2126 * (fg[0] / 255) ** 2.2 +
        0.7152 * (fg[1] / 255) ** 2.2 +
        0.0722 * (fg[2] / 255) ** 2.2;
      const isSecondary = nearRgb(fg, secondary, 14);
      const isLightToken = fgL > 0.62;
      if (!isSecondary && !isLightToken) continue;
      matched.push(el);
    }
    globalThis.__contrastGreyElements = matched;
    return matched.map((el) => ({
      tag: el.tagName.toLowerCase(),
      className: el.className?.toString?.().slice(0, 80) ?? "",
      color: getComputedStyle(el).color,
      text: (el.textContent ?? "").trim().slice(0, 72),
    }));
  });
}

async function greyItemClips(page) {
  return page.evaluate(() => {
    const list = globalThis.__contrastGreyElements ?? [];
    return list.map((el) => {
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    });
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
  await page.evaluate(() => window.scrollTo(0, 0));

  const metas = await collectSecondaryGreyItems(page);
  const items = metas.map((meta) => ({ meta, darkest: null }));

  const started = Date.now();
  let step = 0;
  const docHeight = await page.evaluate(
    () => document.documentElement.scrollHeight
  );
  while (Date.now() - started < ANIMATION_MS) {
    const viewport = page.viewportSize()?.height ?? 900;
    const scrollY = Math.floor(
      (step / 24) * Math.max(0, docHeight - viewport)
    );
    await page.evaluate((y) => window.scrollTo(0, y), scrollY);
    await page.mouse.move(140 + (step % 11) * 34, 260 + (step % 9) * 26);
    await page.waitForTimeout(SAMPLE_INTERVAL_MS);
    let png;
    try {
      png = decodePng(
        await page.screenshot({ type: "png", animations: "disabled" })
      );
    } catch {
      step += 1;
      continue;
    }
    const clips = await greyItemClips(page);
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const clip = clips[i];
      if (!clip || clip.width < 2 || clip.height < 2) continue;
      const viewport = page.viewportSize();
      if (
        viewport &&
        (clip.y + clip.height < 0 ||
          clip.y > viewport.height ||
          clip.x + clip.width < 0 ||
          clip.x > viewport.width)
      ) {
        continue;
      }
      const fg = parseRgb(item.meta.color);
      if (!fg) continue;
      for (const backdrop of backdropClips(clip)) {
        const px =
          darkestPixelInRegion(png, backdrop, 2, fg) ??
          backgroundPixelInRegion(png, backdrop, fg);
        item.darkest = mergeDarkest(item.darkest, px);
      }
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
