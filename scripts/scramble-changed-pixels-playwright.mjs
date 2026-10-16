import { chromium } from "playwright";

const ORIGIN = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const BOX = 240;

const QA_INIT = () => {
  window.__PORTFOLIO_QA_LAST_READ__ = null;
  window.__PORTFOLIO_QA_READ_CANVAS__ = (gl, canvas) => {
    const spec = window.__PORTFOLIO_QA_BOX__;
    if (!spec) return;
    const { cx, cy, box } = spec;
    const scale = canvas.width / canvas.clientWidth;
    const x0 = Math.max(0, Math.floor((cx - box / 2) * scale));
    const y0 = Math.max(0, Math.floor((cy - box / 2) * scale));
    const size = Math.floor(box * scale);
    const w = canvas.width;
    const h = canvas.height;
    const readW = Math.min(size, w - x0);
    const readH = Math.min(size, h - y0);
    const buf = new Uint8Array(readW * readH * 4);
    gl.readPixels(x0, h - y0 - readH, readW, readH, gl.RGBA, gl.UNSIGNED_BYTE, buf);
    window.__PORTFOLIO_QA_LAST_READ__ = { buf: [...buf], readW, readH };
  };
};

function countChanged(a, b) {
  if (!a || !b || a.buf.length !== b.buf.length) return -1;
  let changed = 0;
  for (let i = 0; i < a.buf.length; i += 4) {
    if (
      Math.abs(a.buf[i] - b.buf[i]) > 2 ||
      Math.abs(a.buf[i + 1] - b.buf[i + 1]) > 2 ||
      Math.abs(a.buf[i + 2] - b.buf[i + 2]) > 2 ||
      Math.abs(a.buf[i + 3] - b.buf[i + 3]) > 2
    ) {
      changed += 1;
    }
  }
  return changed;
}

async function waitForRead(page) {
  await page.waitForFunction(() => window.__PORTFOLIO_QA_LAST_READ__ != null, {
    timeout: 8000,
  });
  return page.evaluate(() => window.__PORTFOLIO_QA_LAST_READ__);
}

async function main() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--enable-webgl", "--use-gl=angle", "--use-angle=swiftshader-webgl"],
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.addInitScript(QA_INIT);
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

  await page.evaluate(
    ({ cx, cy, box: boxPx }) => {
      window.__PORTFOLIO_QA_LAST_READ__ = null;
      window.__PORTFOLIO_QA_BOX__ = { cx, cy, box: boxPx };
    },
    { cx, cy, box: BOX }
  );
  const baseline = await waitForRead(page);

  await page.mouse.move(cx, cy);
  await page.waitForTimeout(300);
  for (let i = 0; i < 6; i++) {
    await page.mouse.move(cx + 20 + i * 18, cy - 10 + i * 12);
    await page.waitForTimeout(120);
  }
  await page.waitForTimeout(500);

  await page.evaluate(() => {
    window.__PORTFOLIO_QA_LAST_READ__ = null;
  });
  const after = await waitForRead(page);

  const changedPixels = countChanged(baseline, after);
  const headlineAfter = await page.evaluate(() => {
    const h1 = document.querySelector("[data-portfolio-ui] h1");
    return h1 ? h1.innerText : "";
  });

  const report = {
    boxPx: BOX,
    sampleCenter: { cx, cy },
    changedPixels,
    readMethod: "same-frame gl.readPixels via __PORTFOLIO_QA_READ_CANVAS__",
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
