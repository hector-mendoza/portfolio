import { chromium } from "playwright";

const ORIGIN = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

async function frameCount(page) {
  return page.evaluate(() => window.__SCENE_FRAME_COUNT ?? 0);
}

async function sampleDelta(page, ms) {
  const start = await frameCount(page);
  await page.waitForTimeout(ms);
  const end = await frameCount(page);
  return end - start;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
  });
  const page = await context.newPage();

  await page.goto(`${ORIGIN}/`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(
    () => document.documentElement.getAttribute("data-scene") === "living",
    { timeout: 20000 }
  );

  const tier = await page.evaluate(() => {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const narrow = window.innerWidth < 768;
    return { coarse, narrow, innerWidth: window.innerWidth };
  });
  if (!tier.coarse && !tier.narrow) {
    throw new Error(`Expected calm tier signals, got ${JSON.stringify(tier)}`);
  }

  const idle1s = await sampleDelta(page, 1000);
  if (idle1s < 2) {
    throw new Error(`Expected idle ~4fps draws; got delta=${idle1s} in 1s`);
  }

  await page.evaluate(() => window.scrollTo(0, 120));
  await page.waitForTimeout(100);
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

  await page.evaluate(() => window.scrollTo(0, 240));
  await page.waitForTimeout(100);
  const wake = await sampleDelta(page, 800);
  if (wake < 6) {
    throw new Error(`Expected scroll to wake active tier; delta=${wake}`);
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        tier,
        idle1s,
        active1s,
        idleAfter,
        wakeAfterScroll: wake,
        dataScene: await page.evaluate(() =>
          document.documentElement.getAttribute("data-scene")
        ),
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
