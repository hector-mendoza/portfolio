import { chromium } from "playwright";

const ORIGIN = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const VIEWPORT = { width: 390, height: 844 };
const ONE_FRAME_MS = 1000 / 60;
const MAX_WAKE_MS = ONE_FRAME_MS * 1.25;

async function frameCount(page) {
  return page.evaluate(() => window.__SCENE_FRAME_COUNT ?? 0);
}

async function installWakeProbe(page, kind) {
  await page.evaluate((inputKind) => {
    globalThis.calmWakeReport = null;
    const waitForSceneFrame = (t0) => {
      const start = window.__SCENE_FRAME_COUNT ?? 0;
      const step = () => {
        if ((window.__SCENE_FRAME_COUNT ?? 0) > start) {
          const readEventTiming = () => {
            const entries = performance.getEntriesByType("event");
            const match = [...entries]
              .reverse()
              .find(
                (e) =>
                  e.name === inputKind ||
                  e.name === "touchstart" ||
                  e.name === "scroll"
              );
            if (!match) return null;
            return {
              name: match.name,
              durationMs: Math.round(match.duration * 100) / 100,
              processingStartMs:
                Math.round((match.processingStart - match.startTime) * 100) /
                100,
              inpEstimateMs:
                Math.round((match.processingStart - match.startTime + match.duration) * 100) /
                100,
            };
          };
          globalThis.calmWakeReport = {
            kind: inputKind,
            wakeLatencyMs: Math.round((performance.now() - t0) * 100) / 100,
            sceneFrameDelta:
              (window.__SCENE_FRAME_COUNT ?? 0) - start,
            eventTiming: readEventTiming(),
          };
          return;
        }
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    if (inputKind === "touchstart") {
      window.addEventListener(
        "touchstart",
        () => waitForSceneFrame(performance.now()),
        { once: true, passive: true }
      );
    } else {
      window.addEventListener(
        "scroll",
        () => waitForSceneFrame(performance.now()),
        { once: true, passive: true }
      );
    }
  }, kind);
}

async function readWakeReport(page) {
  return page.evaluate(() => globalThis.calmWakeReport ?? null);
}

async function loadCalmPage(context) {
  const page = await context.newPage();
  await page.goto(`${ORIGIN}/`, { waitUntil: "load" });
  await page.waitForFunction(
    () => document.documentElement.getAttribute("data-scene") === "living",
    { timeout: 25000 }
  );
  await page.waitForTimeout(4000);
  return page;
}

async function assertFrozen(page) {
  const start = await frameCount(page);
  await page.waitForTimeout(1000);
  const delta = (await frameCount(page)) - start;
  if (delta > 0) {
    throw new Error(`Expected frozen calm loop; scene frame delta=${delta} in 1s`);
  }
}

async function main() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--enable-webgl", "--use-gl=angle", "--use-angle=swiftshader-webgl"],
  });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    hasTouch: true,
  });

  const touchPage = await loadCalmPage(context);
  const tier = await touchPage.evaluate(() => ({
    coarse: window.matchMedia("(pointer: coarse)").matches,
    innerWidth: window.innerWidth,
  }));
  if (!tier.coarse || tier.innerWidth >= 768) {
    throw new Error(`Expected calm mobile tier, got ${JSON.stringify(tier)}`);
  }

  await assertFrozen(touchPage);
  await installWakeProbe(touchPage, "touchstart");
  await touchPage.touchscreen.tap(VIEWPORT.width / 2, VIEWPORT.height * 0.45);
  await touchPage.waitForFunction(() => globalThis.calmWakeReport != null, {
    timeout: 800,
  });
  const touchWake = await readWakeReport(touchPage);
  if (!touchWake || touchWake.wakeLatencyMs > MAX_WAKE_MS) {
    throw new Error(
      `Touch wake latency ${touchWake?.wakeLatencyMs ?? "?"}ms > ${MAX_WAKE_MS}ms`
    );
  }

  const activeDelta = await (async () => {
    const start = await frameCount(touchPage);
    await touchPage.waitForTimeout(1000);
    return (await frameCount(touchPage)) - start;
  })();
  if (activeDelta < 6) {
    throw new Error(`Expected ~24fps after wake; delta=${activeDelta} in 1s`);
  }
  await touchPage.close();

  const scrollPage = await loadCalmPage(context);
  await assertFrozen(scrollPage);
  await installWakeProbe(scrollPage, "scroll");
  await scrollPage.evaluate(() => window.scrollTo(0, 120));
  await scrollPage.waitForFunction(() => globalThis.calmWakeReport != null, {
    timeout: 800,
  });
  const scrollWake = await readWakeReport(scrollPage);

  if (!scrollWake || scrollWake.wakeLatencyMs > MAX_WAKE_MS) {
    throw new Error(
      `Scroll wake latency ${scrollWake?.wakeLatencyMs ?? "?"}ms > ${MAX_WAKE_MS}ms`
    );
  }

  const report = {
    ok: true,
    viewport: VIEWPORT,
    tier,
    oneFrameBudgetMs: Math.round(ONE_FRAME_MS * 100) / 100,
    touchWake,
    scrollWake,
    activeSceneFrameDelta1sAfterTouch: activeDelta,
  };

  console.log(JSON.stringify(report, null, 2));
  await scrollPage.close();
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
