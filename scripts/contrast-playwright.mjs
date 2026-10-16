import { chromium } from "playwright";

function relLum(r, g, b) {
  const lin = (c) =>
    c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  const [lr, lg, lb] = [r, g, b].map((v) => lin(v / 255));
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

function contrastRatio(fg, bg) {
  const l1 = relLum(...fg);
  const l2 = relLum(...bg);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

async function sampleCanvas(page, mutedHex) {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("http://localhost:3000/", { waitUntil: "load" });
  await page.waitForFunction(
    () => document.documentElement.getAttribute("data-scene") === "living"
  );
  await page.evaluate((hex) => {
    document.getElementById("measure-muted-style")?.remove();
    const s = document.createElement("style");
    s.id = "measure-muted-style";
    s.textContent = `[data-portfolio-ui]{--muted:${hex}!important}`;
    document.head.appendChild(s);
  }, mutedHex);
  await page.locator("#work").scrollIntoViewIfNeeded();
  await page.mouse.move(420, 280);
  await page.waitForTimeout(600);

  const sels = {
    workIntro: "#work [class*='headingAside'] > p",
    projectNumber: "#work a.project [class*='projectNumber']",
    projectMeta: "#work a.project [class*='projectTitle'] small",
  };

  const ratios = { workIntro: [], projectNumber: [], projectMeta: [] };
  const meta = {};

  for (let f = 0; f < 8; f++) {
    await page.mouse.move(360 + f * 40, 240 + (f % 3) * 35);
    await page.waitForTimeout(150);
    const frame = await page.evaluate((sels) => {
      function relLum(r, g, b) {
        const lin = (c) =>
          c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
        const [lr, lg, lb] = [r, g, b].map((v) => lin(v / 255));
        return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
      }
      const canvas = document.querySelector("canvas");
      if (!canvas || !canvas.width) return null;
      const ctx2 = document.createElement("canvas").getContext("2d");
      const off = ctx2.canvas;
      off.width = canvas.width;
      off.height = canvas.height;
      ctx2.drawImage(canvas, 0, 0);
      const sx = canvas.width / window.innerWidth;
      const sy = canvas.height / window.innerHeight;
      const out = {};
      for (const [key, sel] of Object.entries(sels)) {
        const el = document.querySelector(sel);
        if (!el) continue;
        const fg = getComputedStyle(el).color.match(/\d+/g).map(Number);
        const rect = el.getBoundingClientRect();
        let darkest = null;
        let minL = Infinity;
        for (let x = rect.left + 2; x < rect.right - 2; x += 3) {
          for (let y = rect.top + 2; y < rect.bottom - 2; y += 3) {
            const px = Math.min(off.width - 1, Math.floor(x * sx));
            const py = Math.min(off.height - 1, Math.floor(y * sy));
            const d = ctx2.getImageData(px, py, 1, 1).data;
            const rgb = [d[0], d[1], d[2]];
            const l = relLum(...rgb);
            if (l < minL) {
              minL = l;
              darkest = rgb;
            }
          }
        }
        out[key] = { fg, darkest };
      }
      return out;
    }, sels);

    if (!frame) continue;
    for (const [key, data] of Object.entries(frame)) {
      if (!data?.darkest) continue;
      ratios[key].push(contrastRatio(data.fg, data.darkest));
      meta[key] = { fg: data.fg, darkestBg: data.darkest };
    }
  }

  const summary = {};
  for (const key of Object.keys(sels)) {
    const rs = ratios[key];
    summary[key] = {
      ...meta[key],
      min: rs.length ? Math.min(...rs) : null,
      max: rs.length ? Math.max(...rs) : null,
    };
  }
  return summary;
}

const browser = await chromium.launch();
const page = await browser.newPage();
const before = await sampleCanvas(page, "#626262");
const after = await sampleCanvas(page, "#3c3c3c");
await browser.close();

const bg167 = [167, 167, 166];
console.log(
  JSON.stringify(
    {
      exactMutedForRgb167: "#3d3d3d",
      tokenApplied: "#3c3c3c",
      vs167: {
        before626262: +contrastRatio([98, 98, 98], bg167).toFixed(2),
        after3c3c3c: +contrastRatio([60, 60, 60], bg167).toFixed(2),
      },
      playwrightCanvasSamples: { before, after },
    },
    null,
    2
  )
);
