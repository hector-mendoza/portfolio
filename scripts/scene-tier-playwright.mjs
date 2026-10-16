import { chromium } from "playwright";

const ORIGIN = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

async function frameCount(page) {
  return page.evaluate(() => window.__SCENE_FRAME_COUNT ?? 0);
}

async function sampleDelta(page, ms) {
  const start = await frameCount(page);
  await page.waitForTimeout(ms);
  return (await frameCount(page)) - start;
}

async function main() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--enable-webgl", "--use-gl=angle", "--use-angle=swiftshader-webgl"],
  });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
  });
  const page = await context.newPage();

  await page.goto(`${ORIGIN}/`, { waitUntil: "load" });
  await page.waitForFunction(
    () => document.documentElement.getAttribute("data-scene") === "living",
    { timeout: 25000 }
  );
  await page.waitForTimeout(4000);

  const tier = await page.evaluate(() => ({
    coarse: window.matchMedia("(pointer: coarse)").matches,
    narrow: window.innerWidth < 768,
    innerWidth: window.innerWidth,
  }));
  if (!tier.coarse && !tier.narrow) {
    throw new Error(`Expected calm tier signals, got ${JSON.stringify(tier)}`);
  }

  const frozen1s = await sampleDelta(page, 1000);
  if (frozen1s > 0) {
    throw new Error(
      `Expected static first frame (no loop) before input; delta=${frozen1s} in 1s`
    );
  }

  await page.evaluate(() => {
    globalThis.calmWakeReport = null;
    window.addEventListener(
      "scroll",
      () => {
        const t0 = performance.now();
        const start = window.__SCENE_FRAME_COUNT ?? 0;
        const step = () => {
          if ((window.__SCENE_FRAME_COUNT ?? 0) > start) {
            globalThis.calmWakeReport = {
              wakeLatencyMs: Math.round((performance.now() - t0) * 100) / 100,
            };
            return;
          }
          requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      },
      { once: true, passive: true }
    );
  });
  await page.evaluate(() => window.scrollTo(0, 120));
  await page.waitForFunction(() => globalThis.calmWakeReport != null, {
    timeout: 800,
  });

  const active1s = await sampleDelta(page, 1000);
  if (active1s < 8) {
    throw new Error(
      `Expected calm active ~24fps draws after scroll; got delta=${active1s} in 1s`
    );
  }

  await page.waitForTimeout(2000);
  const idleAfter = await sampleDelta(page, 1000);
  if (idleAfter > active1s) {
    throw new Error(
      `Expected idle rate below active; idle=${idleAfter} active=${active1s}`
    );
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        tier,
        frozenBeforeInput1s: frozen1s,
        wakeAfterScroll: await page.evaluate(() => globalThis.calmWakeReport),
        active1s,
        idleAfter,
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
