import { chromium } from "playwright";

const ORIGIN = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const IDLE_MS = 2000;
const SAMPLE_MS = 2000;

const EFFECT_FILES = [
  "lib/scene/schedule.ts",
  "components/SpotlightCard.jsx",
  "components/Magnet.jsx",
  "components/block/rectangular-text-reveal.jsx",
  "components/block/text-fill-animation.jsx",
  "components/ClickSpark.jsx",
  "lib/hairline-ambient.js",
  "public/vendor/hairline-kernel.js",
];

async function readProbe(page) {
  return page.evaluate((files) => {
    const ticks = window.__EFFECT_RAF_TICKS__ ?? {};
    const pending = window.__EFFECT_RAF_PENDING__ ?? {};
    const out = {};
    for (const f of files) {
      out[f] = {
        ticks: ticks[f] ?? 0,
        pending: pending[f] ?? 0,
      };
    }
    return {
      perFile: out,
      sceneFrames: window.__SCENE_FRAME_COUNT ?? 0,
      scheduleTicks: window.__SCHEDULE_NATIVE_RAF_TICKS ?? 0,
      scheduleSchedules: window.__SCHEDULE_NATIVE_RAF_SCHEDULES ?? 0,
      schedulePending: window.__SCHEDULE_NATIVE_RAF_PENDING ?? false,
      rafId: window.__SCENE_RAF_ID ?? null,
      visibilityState: document.visibilityState,
    };
  }, EFFECT_FILES);
}

async function sampleDelta(page, ms) {
  const start = await readProbe(page);
  await page.waitForTimeout(ms);
  const end = await readProbe(page);
  const perFileDelta = {};
  for (const f of EFFECT_FILES) {
    let tickDelta = end.perFile[f].ticks - start.perFile[f].ticks;
    if (f === "lib/scene/schedule.ts") {
      tickDelta = end.scheduleTicks - start.scheduleTicks;
    }
    perFileDelta[f] = {
      tickDelta,
      pendingEnd: end.perFile[f].pending,
    };
  }
  return {
    start,
    end,
    sceneFrameDelta: end.sceneFrames - start.sceneFrames,
    scheduleTickDelta: end.scheduleTicks - start.scheduleTicks,
    perFileDelta,
  };
}

async function hideViaSecondTab(context, page) {
  const blank = await context.newPage();
  await blank.goto("about:blank");
  await page.waitForTimeout(800);
  const metrics = await readProbe(page);
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

function assertNoStrayEffectPending(perFileDelta, phase) {
  for (const f of EFFECT_FILES) {
    if (f === "lib/scene/schedule.ts") continue;
    const { pendingEnd, tickDelta } = perFileDelta[f];
    if (pendingEnd > 0) {
      throw new Error(
        `${phase}: allowlisted effect ${f} still has pending rAF (${pendingEnd})`
      );
    }
    if (tickDelta > 0) {
      throw new Error(
        `${phase}: allowlisted effect ${f} ticked after idle (${tickDelta} ticks in sample window)`
      );
    }
  }
}

async function launchBrowser() {
  return chromium.launch({
    headless: true,
    args: [
      "--enable-webgl",
      "--use-gl=angle",
      "--use-angle=swiftshader-webgl",
    ],
  });
}

async function main() {
  const browser = await launchBrowser();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();

  await page.goto(`${ORIGIN}/`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(
    () => document.documentElement.getAttribute("data-scene") === "living",
    { timeout: 20000 }
  );
  await page.waitForTimeout(1500);

  await page.keyboard.press("Control+K");
  await page.waitForTimeout(400);
  const spotlightPanel = page.locator('[role="dialog"], [data-spotlight]').first();
  if (await spotlightPanel.count()) {
    await spotlightPanel.hover({ timeout: 5000 }).catch(() => undefined);
  } else {
    await page.locator("input").first().hover({ timeout: 5000 }).catch(() => undefined);
  }
  await page.keyboard.press("Escape");
  await page.waitForTimeout(200);

  const terminal = page.getByText("Move your pointer across the system.");
  await terminal.scrollIntoViewIfNeeded();
  const termBox = await terminal.boundingBox();
  if (termBox) {
    await page.mouse.move(termBox.x + termBox.width * 0.35, termBox.y - 80);
    await page.mouse.move(termBox.x + termBox.width * 0.65, termBox.y - 40);
  }

  const explore = page.getByRole("link", { name: /Explore selected work/i });
  await explore.scrollIntoViewIfNeeded();
  const linkBox = await explore.boundingBox();
  if (linkBox) {
    await page.mouse.move(linkBox.x + 12, linkBox.y + linkBox.height / 2);
    await page.mouse.move(linkBox.x + 36, linkBox.y + linkBox.height / 2 - 8);
  }
  await page.waitForTimeout(200);

  await page.getByText("Philosophy").scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await page.evaluate(() => window.scrollBy(0, 160));
  await page.waitForTimeout(800);

  await page.mouse.move(24, 24);
  await page.waitForTimeout(IDLE_MS);

  const idleSample = await sampleDelta(page, SAMPLE_MS);

  const maxIdleScheduleTicks = 28;
  const minIdleScheduleTicks = 4;
  if (idleSample.scheduleTickDelta > maxIdleScheduleTicks) {
    throw new Error(
      `After ${IDLE_MS}ms idle, scheduler rAF still hot: ${idleSample.scheduleTickDelta} ticks in ${SAMPLE_MS}ms (expected ~${minIdleScheduleTicks}-${maxIdleScheduleTicks} at idle tier)`
    );
  }
  if (idleSample.scheduleTickDelta < minIdleScheduleTicks) {
    throw new Error(
      `Scheduler rAF too quiet after idle: ${idleSample.scheduleTickDelta} ticks in ${SAMPLE_MS}ms`
    );
  }

  assertNoStrayEffectPending(idleSample.perFileDelta, "post-idle");

  await page.mouse.move(640, 400);
  await page.waitForTimeout(100);

  const { blank, mode: hideMode } = await hideViaSecondTab(context, page);
  await page.waitForTimeout(400);

  const hiddenProbe = await readProbe(page);
  if (hiddenProbe.rafId !== null) {
    throw new Error(
      `Expected no pending scene rAF while hidden; got rafId=${hiddenProbe.rafId}`
    );
  }
  if (hiddenProbe.schedulePending) {
    throw new Error("Expected scheduler native rAF cleared while hidden");
  }

  const hiddenSample = await sampleDelta(page, SAMPLE_MS);
  if (hiddenSample.scheduleTickDelta !== 0) {
    throw new Error(
      `Hidden tab must have 0 scheduler rAF ticks; got ${hiddenSample.scheduleTickDelta}`
    );
  }
  if (hiddenSample.sceneFrameDelta > 0) {
    throw new Error(
      `Hidden tab must not draw scene frames; delta=${hiddenSample.sceneFrameDelta}`
    );
  }

  if (blank) await blank.close();

  const report = {
    ok: true,
    hideMode,
    idleAfterInteractionMs: IDLE_MS,
    sampleWindowMs: SAMPLE_MS,
    idle: {
      sceneFrameDelta: idleSample.sceneFrameDelta,
      scheduleTickDelta: idleSample.scheduleTickDelta,
      perFile: idleSample.perFileDelta,
    },
    hidden: {
      sceneFrameDelta: hiddenSample.sceneFrameDelta,
      scheduleTickDelta: hiddenSample.scheduleTickDelta,
      perFile: hiddenSample.perFileDelta,
      rafId: hiddenProbe.rafId,
    },
  };

  console.log(JSON.stringify(report, null, 2));
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
