import { chromium } from "playwright";
import { execSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  NATIVE_RAF_COUNTER_INIT,
  sampleNativeRafDelta,
} from "./native-raf-counter-init.mjs";
import { contrastRatio, darkestPixel, decodePng } from "./playwright-image-utils.mjs";

const ORIGIN = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const ANIMATION_MS = 5000;
const SAMPLE_MS = 200;

async function runLighthouseRuns() {
  const runs = [];
  for (let i = 0; i < 3; i++) {
    const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "lh-"));
    const outPath = path.join(outDir, "report.json");
    execSync(
      `npx --yes lighthouse ${ORIGIN}/ --quiet --chrome-flags="--headless --no-sandbox --disable-gpu" --only-categories=performance --form-factor=mobile --screenEmulation.mobile=true --throttling-method=simulate --output=json --output-path=${outPath}`,
      { stdio: "pipe" }
    );
    const report = JSON.parse(fs.readFileSync(outPath, "utf8"));
    runs.push({
      run: i + 1,
      score: Math.round(report.categories.performance.score * 100),
      lcpMs: Math.round(report.audits["largest-contentful-paint"].numericValue),
      tbtMs: Math.round(report.audits["total-blocking-time"].numericValue),
      cls: report.audits["cumulative-layout-shift"]?.numericValue ?? null,
    });
  }
  return runs;
}

async function measureContrastWorst(page) {
  const loc = page
    .locator("[data-portfolio-ui] p, [data-portfolio-ui] span, [data-portfolio-ui] code")
    .filter({ hasText: /.+/ });
  const count = await loc.count();
  let worst = null;
  for (let i = 0; i < count; i++) {
    const el = loc.nth(i);
    const meta = await el.evaluate((node) => {
      const text = (node.textContent ?? "").trim();
      if (text.length < 1) return null;
      const style = getComputedStyle(node);
      return { text: text.slice(0, 60), color: style.color };
    });
    if (!meta) continue;
    await el.scrollIntoViewIfNeeded().catch(() => undefined);
    let merged = null;
    const start = Date.now();
    let step = 0;
    while (Date.now() - start < ANIMATION_MS) {
      await page.mouse.move(120 + (step % 10) * 30, 200 + (step % 8) * 24);
      await page.waitForTimeout(SAMPLE_MS);
      const clip = await el.boundingBox();
      if (!clip) continue;
      const png = decodePng(
        await page.screenshot({ type: "png", clip, animations: "disabled" })
      );
      const px = darkestPixel(png);
      if (px) {
        const m = meta.color.match(/rgba?\(([^)]+)\)/);
        const fg = m
          ? m[1].split(",").slice(0, 3).map((s) => parseFloat(s.trim()))
          : null;
        if (fg) {
          const ratio = contrastRatio(fg, px);
          if (!worst || ratio < worst.ratio) {
            worst = {
              ratio: Math.round(ratio * 100) / 100,
              text: meta.text,
              color: meta.color,
              darkestScreenshotPixelRgb: px,
            };
          }
        }
      }
      step += 1;
    }
  }
  return worst;
}

async function scramblePixels(page) {
  const hero = page.locator("[data-section='hero']");
  await hero.scrollIntoViewIfNeeded();
  const box = await hero.boundingBox();
  const cx = box ? box.x + box.width * 0.55 : 200;
  const cy = box ? box.y + box.height * 0.45 : 200;
  const clip = { x: Math.max(0, cx - 120), y: Math.max(0, cy - 120), width: 240, height: 240 };
  const before = decodePng(await page.screenshot({ type: "png", clip }));
  await page.mouse.move(cx, cy);
  for (let i = 0; i < 8; i++) {
    await page.mouse.move(cx + 20 + i * 20, cy - 10 + i * 14);
    await page.waitForTimeout(100);
  }
  await page.waitForTimeout(400);
  const after = decodePng(await page.screenshot({ type: "png", clip }));
  let changed = 0;
  for (let i = 0; i < before.data.length; i += 4) {
    if (
      Math.abs(before.data[i] - after.data[i]) > 2 ||
      Math.abs(before.data[i + 1] - after.data[i + 1]) > 2 ||
      Math.abs(before.data[i + 2] - after.data[i + 2]) > 2
    ) {
      changed += 1;
    }
  }
  return changed;
}

async function wakeLatency(page, kind) {
  await page.evaluate((inputKind) => {
    globalThis.calmWakeReport = null;
    const wait = (t0) => {
      const start = window.__SCENE_FRAME_COUNT ?? 0;
      const step = () => {
        if ((window.__SCENE_FRAME_COUNT ?? 0) > start) {
          let eventTiming = null;
          const e = [...performance.getEntriesByType("event")]
            .reverse()
            .find((x) => x.name === inputKind || x.name === "touchstart");
          if (e) {
            eventTiming = {
              durationMs: Math.round(e.duration * 100) / 100,
              processingStartMs:
                Math.round((e.processingStart - e.startTime) * 100) / 100,
            };
          }
          globalThis.calmWakeReport = {
            wakeLatencyMs: Math.round((performance.now() - t0) * 100) / 100,
            eventTiming,
          };
          return;
        }
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if (inputKind === "touchstart") {
      window.addEventListener("touchstart", () => wait(performance.now()), {
        once: true,
        passive: true,
      });
    } else {
      window.addEventListener("scroll", () => wait(performance.now()), {
        once: true,
        passive: true,
      });
    }
  }, kind);
  if (kind === "touchstart") {
    await page.touchscreen.tap(195, 380);
  } else {
    await page.evaluate(() => window.scrollTo(0, 160));
  }
  await page.waitForFunction(() => globalThis.calmWakeReport != null, { timeout: 800 });
  return page.evaluate(() => globalThis.calmWakeReport);
}

async function measureCls(page) {
  await page.addInitScript(() => {
    globalThis.__layoutShiftSum = 0;
    try {
      const po = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.hadRecentInput) continue;
          globalThis.__layoutShiftSum += entry.value;
        }
      });
      po.observe({ type: "layout-shift", buffered: true });
    } catch {
      /* unsupported */
    }
  });
  await page.goto(`${ORIGIN}/`, { waitUntil: "load" });
  await page.waitForFunction(
    () => document.documentElement.getAttribute("data-scene") === "living",
    { timeout: 25000 }
  );
  await page.waitForTimeout(6000);
  return page.evaluate(() => globalThis.__layoutShiftSum ?? 0);
}

async function main() {
  const headSha = execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
  if (process.env.QA_SKIP_BUILD !== "1") {
    execSync("npm run build", { stdio: "inherit" });
    execSync("npm test", { stdio: "inherit" });
  }

  const browser = await chromium.launch({
    headless: true,
    args: ["--enable-webgl", "--use-gl=angle", "--use-angle=swiftshader-webgl"],
  });

  const desktopCtx = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const desktop = await desktopCtx.newPage();
  await desktop.addInitScript(NATIVE_RAF_COUNTER_INIT);
  await desktop.goto(`${ORIGIN}/`, { waitUntil: "load" });
  await desktop.waitForFunction(
    () => document.documentElement.getAttribute("data-scene") === "living",
    { timeout: 25000 }
  );
  await desktop.waitForTimeout(5000);
  await desktop.mouse.move(640, 400);
  await desktop.waitForTimeout(2500);
  const idleDesktop = await sampleNativeRafDelta(desktop, 2000);
  await desktop.mouse.move(700, 420);
  await desktop.waitForTimeout(500);
  const afterInteractionDesktop = await sampleNativeRafDelta(desktop, 800);

  const calmCtx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
  });
  const calm = await calmCtx.newPage();
  await calm.addInitScript(NATIVE_RAF_COUNTER_INIT);
  await calm.goto(`${ORIGIN}/`, { waitUntil: "load" });
  await calm.waitForFunction(
    () => document.documentElement.getAttribute("data-scene") === "living",
    { timeout: 25000 }
  );
  await calm.waitForTimeout(4000);
  const idleCalm = await sampleNativeRafDelta(calm, 2000);
  const touchWake = await wakeLatency(calm, "touchstart");
  const scrollCalmPage = await calmCtx.newPage();
  await scrollCalmPage.addInitScript(NATIVE_RAF_COUNTER_INIT);
  await scrollCalmPage.goto(`${ORIGIN}/`, { waitUntil: "load" });
  await scrollCalmPage.waitForFunction(
    () => document.documentElement.getAttribute("data-scene") === "living",
    { timeout: 25000 }
  );
  await scrollCalmPage.waitForTimeout(4000);
  const scrollWake = await wakeLatency(scrollCalmPage, "scroll");

  const hiddenPage = await desktopCtx.newPage();
  await hiddenPage.addInitScript(NATIVE_RAF_COUNTER_INIT);
  await hiddenPage.goto(`${ORIGIN}/`, { waitUntil: "load" });
  await hiddenPage.waitForFunction(
    () => document.documentElement.getAttribute("data-scene") === "living",
    { timeout: 25000 }
  );
  await hiddenPage.waitForTimeout(3000);
  await hiddenPage.mouse.move(640, 400);
  await hiddenPage.waitForTimeout(500);
  const blank = await desktopCtx.newPage();
  await blank.goto("about:blank");
  await hiddenPage.waitForTimeout(600);
  const hiddenRaf = await sampleNativeRafDelta(hiddenPage, 2000);

  const contrastPage = await desktopCtx.newPage();
  await contrastPage.goto(`${ORIGIN}/`, { waitUntil: "load" });
  await contrastPage.waitForFunction(
    () => document.documentElement.getAttribute("data-scene") === "living",
    { timeout: 25000 }
  );
  await contrastPage.waitForTimeout(3000);
  const worstContrast = await measureContrastWorst(contrastPage);
  const scramble = await scramblePixels(desktop);

  const clsPage = await desktopCtx.newPage();
  const cls = await measureCls(clsPage);

  const lighthouse = await runLighthouseRuns();

  const report = {
    headSha,
    build: "ok",
    tests: "ok",
    nativeRaf: {
      idleDesktopPerSec: Math.round(idleDesktop.perSec * 10) / 10,
      idleCalmPerSec: Math.round(idleCalm.perSec * 10) / 10,
      hiddenPerSec: Math.round(hiddenRaf.perSec * 10) / 10,
      afterInteractionDesktopPerSec:
        Math.round(afterInteractionDesktop.perSec * 10) / 10,
      idleDesktopDelta2s: idleDesktop.delta,
      idleCalmDelta2s: idleCalm.delta,
      hiddenDelta2s: hiddenRaf.delta,
    },
    wake: { touch: touchWake, scroll: scrollWake },
    contrastWorst: worstContrast,
    scrambleChangedPixels240px: scramble,
    clsPerformanceObserver: cls,
    lighthouse,
  };

  console.log(JSON.stringify(report, null, 2));
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
