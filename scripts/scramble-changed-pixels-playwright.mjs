import { chromium } from "playwright";
import {
  countChangedPixels,
  decodePng,
} from "./playwright-image-utils.mjs";

const ORIGIN = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const BOX = 240;

async function clipScreenshot(page, clip) {
  const buffer = await page.screenshot({
    type: "png",
    clip,
    animations: "disabled",
  });
  return decodePng(buffer);
}

async function main() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--enable-webgl", "--use-gl=angle", "--use-angle=swiftshader-webgl"],
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto(`${ORIGIN}/`, { waitUntil: "load" });
  await page.waitForFunction(
    () => document.documentElement.getAttribute("data-scene") === "living",
    { timeout: 25000 }
  );
  await page.waitForTimeout(4000);

  const headline = await page.evaluate(() => {
    const h1 = document.querySelector("[data-portfolio-ui] h1");
    return h1 ? h1.innerText : "";
  });

  const hero = page.locator("[data-section='hero']");
  await hero.scrollIntoViewIfNeeded();
  const box = await hero.boundingBox();
  const cx = box ? box.x + box.width * 0.55 : 640;
  const cy = box ? box.y + box.height * 0.45 : 320;
  const clip = {
    x: Math.max(0, cx - BOX / 2),
    y: Math.max(0, cy - BOX / 2),
    width: BOX,
    height: BOX,
  };

  const baseline = await clipScreenshot(page, clip);
  await page.mouse.move(cx, cy);
  await page.waitForTimeout(300);
  for (let i = 0; i < 6; i++) {
    await page.mouse.move(cx + 20 + i * 18, cy - 10 + i * 12);
    await page.waitForTimeout(120);
  }
  await page.waitForTimeout(500);
  const after = await clipScreenshot(page, clip);

  const changedPixels = countChangedPixels(baseline, after);
  const headlineAfter = await page.evaluate(() => {
    const h1 = document.querySelector("[data-portfolio-ui] h1");
    return h1 ? h1.innerText : "";
  });

  const report = {
    boxPx: BOX,
    sampleCenter: { cx, cy },
    changedPixels,
    readMethod: "composited page.screenshot clip diff",
    headlineUnchanged: headline === headlineAfter,
    headlineSample: headline.slice(0, 40),
  };

  console.log(JSON.stringify(report, null, 2));
  if (!report.headlineUnchanged) {
    throw new Error("Headline DOM changed during scramble test");
  }
  if (changedPixels < 120) {
    throw new Error(`Expected obvious scramble (>=120 changed pixels); got ${changedPixels}`);
  }
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
