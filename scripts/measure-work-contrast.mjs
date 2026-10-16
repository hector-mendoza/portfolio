/**
 * Samples darkest pixels behind muted work-section text vs computed foreground color.
 * Run via Playwright browser_run_code or: node scripts/measure-work-contrast.mjs (needs playwright)
 */
function relLum(r, g, b) {
  const lin = (c) =>
    c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  const [lr, lg, lb] = [r, g, b].map((v) => lin(v / 255));
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

export function contrastRatio(fgRgb, bgRgb) {
  const l1 = relLum(...fgRgb);
  const l2 = relLum(...bgRgb);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

export function parseRgb(css) {
  const m = css.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!m) return null;
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

export async function measureWorkContrast(page) {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("http://localhost:3000/#work", { waitUntil: "load" });
  await page.evaluate(async () => {
    while (document.documentElement.getAttribute("data-scene") !== "living") {
      await new Promise((r) => requestAnimationFrame(r));
    }
  });
  await page.mouse.move(480, 320);
  await page.waitForTimeout(400);

  const selectors = {
    workIntro: "#work .headingAside p",
    projectNumber: "#work .projectNumber",
    projectMeta: "#work .projectTitle small",
  };

  const frames = 8;
  const results = {};

  for (const [key, sel] of Object.entries(selectors)) {
    results[key] = { ratios: [], fg: null, darkestBg: null };
  }

  for (let f = 0; f < frames; f++) {
    await page.mouse.move(400 + f * 40, 280 + (f % 3) * 30);
    await page.waitForTimeout(120);
    const shot = await page.screenshot({ type: "png" });
    const frameData = await page.evaluate(
      async ({ selectors, pngB64 }) => {
        const img = new Image();
        img.src = "data:image/png;base64," + pngB64;
        await img.decode();
        const c = document.createElement("canvas");
        c.width = img.width;
        c.height = img.height;
        const ctx = c.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const out = {};
        for (const [key, sel] of Object.entries(selectors)) {
          const el = document.querySelector(sel);
          if (!el) continue;
          const rect = el.getBoundingClientRect();
          const fg = getComputedStyle(el).color;
          const dpr = window.devicePixelRatio || 1;
          let darkest = [255, 255, 255];
          let minL = 1;
          const step = Math.max(4, Math.floor(Math.min(rect.width, rect.height) / 6));
          for (let x = rect.left + step; x < rect.right - step; x += step) {
            for (let y = rect.top + step; y < rect.bottom - step; y += step) {
              const px = Math.floor(x * dpr);
              const py = Math.floor(y * dpr);
              const d = ctx.getImageData(px, py, 1, 1).data;
              const rgb = [d[0], d[1], d[2]];
              const l =
                0.2126 * (rgb[0] / 255) ** 2.2 +
                0.7152 * (rgb[1] / 255) ** 2.2 +
                0.0722 * (rgb[2] / 255) ** 2.2;
              if (l < minL) {
                minL = l;
                darkest = rgb;
              }
            }
          }
          out[key] = { fg, darkest };
        }
        return out;
      },
      {
        selectors,
        pngB64: shot.toString("base64"),
      }
    );

    for (const [key, data] of Object.entries(frameData)) {
      const fg = parseRgb(data.fg);
      const bg = data.darkest;
      if (!fg || !bg) continue;
      const ratio = contrastRatio(fg, bg);
      results[key].ratios.push(ratio);
      results[key].fg = data.fg;
      results[key].darkestBg = bg;
    }
  }

  const summary = {};
  for (const [key, val] of Object.entries(results)) {
    const rs = val.ratios;
    summary[key] = {
      fg: val.fg,
      sampleDarkestBg: val.darkestBg,
      min: rs.length ? Math.min(...rs) : null,
      max: rs.length ? Math.max(...rs) : null,
    };
  }
  return summary;
}
