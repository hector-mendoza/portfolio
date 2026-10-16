import { chromium } from "playwright";

const ORIGIN = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

async function readMetrics(page) {
  return page.evaluate(() => ({
    frameCount: window.__SCENE_FRAME_COUNT ?? 0,
    rafId: window.__SCENE_RAF_ID ?? null,
    visibilityState: document.visibilityState,
    dataScene: document.documentElement.getAttribute("data-scene"),
  }));
}

async function sampleFrames(page, ms) {
  const start = await readMetrics(page);
  await page.waitForTimeout(ms);
  const end = await readMetrics(page);
  return {
    start,
    end,
    delta: end.frameCount - start.frameCount,
  };
}

async function hideViaSecondTab(context, page) {
  const blank = await context.newPage();
  await blank.goto("about:blank");
  await page.waitForTimeout(800);
  const metrics = await readMetrics(page);
  if (metrics.visibilityState === "hidden") {
    return { blank, mode: "second-tab" };
  }

  await blank.close();
  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => "hidden",
    });
    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  return { blank: null, mode: "visibilitychange-fallback" };
}

async function showPage(page, blank) {
  if (blank) {
    await page.bringToFront();
    await blank.close();
  } else {
    await page.evaluate(() => {
      Object.defineProperty(document, "visibilityState", {
        configurable: true,
        get: () => "visible",
      });
      Object.defineProperty(document, "hidden", {
        configurable: true,
        get: () => false,
      });
      document.dispatchEvent(new Event("visibilitychange"));
    });
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(`${ORIGIN}/`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(
    () => document.documentElement.getAttribute("data-scene") === "living",
    { timeout: 15000 }
  );

  const visibleWarm = await sampleFrames(page, 1200);
  if (visibleWarm.delta < 1) {
    throw new Error(
      `Expected scene frames while visible; got delta=${visibleWarm.delta}`
    );
  }

  const { blank, mode } = await hideViaSecondTab(context, page);
  await page.waitForTimeout(1200);

  const hidden = await readMetrics(page);
  if (hidden.rafId !== null) {
    throw new Error(`Expected no pending rAF while hidden; got rafId=${hidden.rafId}`);
  }

  const hiddenSample = await sampleFrames(page, 2000);
  if (hiddenSample.delta > 2) {
    throw new Error(
      `Expected ~0 frames while hidden; got delta=${hiddenSample.delta}`
    );
  }

  await showPage(page, blank);
  await page.waitForTimeout(400);

  const afterShow = await sampleFrames(page, 2000);
  if (afterShow.delta < 5) {
    throw new Error(
      `Expected frame() to resume after show; delta=${afterShow.delta}`
    );
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        hideMode: mode,
        hiddenRafId: hidden.rafId,
        hiddenFrameDelta2s: hiddenSample.delta,
        afterShowFrameDelta2s: afterShow.delta,
        dataScene: hidden.dataScene,
      },
      null,
      2
    )
  );

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
