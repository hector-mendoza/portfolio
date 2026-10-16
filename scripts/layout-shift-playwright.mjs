import { chromium } from "playwright";

const ORIGIN = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

async function main() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--enable-webgl", "--use-gl=angle", "--use-angle=swiftshader-webgl"],
  });
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
  });

  await page.addInitScript(() => {
    globalThis.__layoutShiftSum = 0;
    globalThis.__layoutShiftEntries = [];
    try {
      const po = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.hadRecentInput) continue;
          globalThis.__layoutShiftSum += entry.value;
          const sources = (entry.sources ?? []).map((s) => ({
            node:
              s.node?.className?.toString?.().slice(0, 80) ??
              s.node?.nodeName ??
              "",
            previousRect: s.previousRect,
            currentRect: s.currentRect,
          }));
          globalThis.__layoutShiftEntries.push({
            value: entry.value,
            startTime: entry.startTime,
            sources,
          });
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

  const result = await page.evaluate(() => ({
    cls: globalThis.__layoutShiftSum ?? 0,
    entries: globalThis.__layoutShiftEntries ?? [],
  }));

  console.log(JSON.stringify(result, null, 2));
  if (result.cls > 0.001) {
    console.error(`CLS ${result.cls} > 0`);
    process.exit(1);
  }
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
