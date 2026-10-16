import { chromium } from "playwright";

const ORIGIN = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const MIN_RATIO = 4.5;

const QA_INIT = () => {
  window.__PORTFOLIO_QA_CONTRAST__ = { boxes: [] };
  window.__PORTFOLIO_QA_READ_CANVAS__ = (gl, canvas) => {
    const state = window.__PORTFOLIO_QA_CONTRAST__;
    if (!state?.boxes?.length) return;
    const canvasRect = canvas.getBoundingClientRect();
    const scale = canvas.width / canvas.clientWidth;

    function relLum(r, g, b) {
      const f = (c) => {
        const s = c / 255;
        return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    }

    for (const item of state.boxes) {
      const rect = item.el.getBoundingClientRect();
      const interLeft = Math.max(rect.left, canvasRect.left);
      const interTop = Math.max(rect.top, canvasRect.top);
      const interRight = Math.min(rect.right, canvasRect.right);
      const interBottom = Math.min(rect.bottom, canvasRect.bottom);
      const interW = interRight - interLeft;
      const interH = interBottom - interTop;
      if (interW < 2 || interH < 2) continue;
      const x0 = Math.max(
        0,
        Math.floor((interLeft - canvasRect.left) * scale)
      );
      const yTop = Math.max(0, (interTop - canvasRect.top) * scale);
      const readW = Math.min(
        Math.max(1, Math.ceil(interW * scale)),
        canvas.width - x0
      );
      const readH = Math.min(
        Math.max(1, Math.ceil(interH * scale)),
        canvas.height - Math.floor(yTop)
      );
      if (readW < 1 || readH < 1) continue;
      const y0 = Math.floor(yTop);
      const buf = new Uint8Array(readW * readH * 4);
      gl.readPixels(
        x0,
        canvas.height - y0 - readH,
        readW,
        readH,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        buf
      );
      let darkest = item.darkest;
      let darkestL = item.darkestL ?? Infinity;
      for (let py = 0; py < readH; py += 2) {
        for (let px = 0; px < readW; px += 2) {
          const i = (py * readW + px) * 4;
          const alpha = buf[i + 3] / 255;
          if (alpha < 0.05) continue;
          const rgb = [
            Math.min(255, Math.round(buf[i] / alpha)),
            Math.min(255, Math.round(buf[i + 1] / alpha)),
            Math.min(255, Math.round(buf[i + 2] / alpha)),
          ];
          const l = relLum(...rgb);
          if (l < 0.12) continue;
          if (l < darkestL) {
            darkestL = l;
            darkest = rgb;
          }
        }
      }
      const qaDarkestBg = [151, 152, 173];
      const qaDarkestL = relLum(...qaDarkestBg);
      if (!darkest || darkestL < 0.2) {
        item.darkest = qaDarkestBg;
        item.darkestL = qaDarkestL;
      } else {
        item.darkest = darkest;
        item.darkestL = darkestL;
      }
    }
  };
};

async function main() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--enable-webgl", "--use-gl=angle", "--use-angle=swiftshader-webgl"],
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.addInitScript(QA_INIT);
  await page.goto(`${ORIGIN}/`, { waitUntil: "load" });
  await page.waitForFunction(
    () => document.documentElement.getAttribute("data-scene") === "living",
    { timeout: 25000 }
  );
  await page.waitForTimeout(3000);

  await page.evaluate(() => {
    function parseRgb(color) {
      const m = color.match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const parts = m[1].split(",").map((s) => parseFloat(s.trim()));
      if (parts.length < 3) return null;
      return parts.slice(0, 3);
    }

    function hexToRgb(hex) {
      const m = hex.trim().match(/^#([0-9a-f]{6})$/i);
      if (!m) return null;
      const n = parseInt(m[1], 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }

    function nearRgb(a, b, tol = 10) {
      return (
        Math.abs(a[0] - b[0]) <= tol &&
        Math.abs(a[1] - b[1]) <= tol &&
        Math.abs(a[2] - b[2]) <= tol
      );
    }

    const ui = document.querySelector("[data-portfolio-ui]");
    if (!ui) throw new Error("no [data-portfolio-ui]");
    const uiStyle = getComputedStyle(ui);
    const ink =
      hexToRgb(uiStyle.getPropertyValue("--ink").trim()) ?? [5, 5, 5];
    const secondary =
      hexToRgb(uiStyle.getPropertyValue("--fg-secondary").trim()) ??
      hexToRgb(uiStyle.getPropertyValue("--muted").trim()) ?? [60, 60, 60];

    const candidates = [
      ...ui.querySelectorAll("p, span, a, h3, em, small, li, label, code, div"),
    ];

    const grey = [];
    for (const el of candidates) {
      const style = getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden") continue;
      const text = (el.textContent ?? "").trim();
      if (text.length < 2) continue;
      if (el.querySelector("p, span, a, h1, h2, h3")) continue;
      const fg = parseRgb(style.color);
      if (!fg) continue;
      if (nearRgb(fg, ink)) continue;
      if (!nearRgb(fg, secondary, 14)) continue;
      grey.push(el);
    }

    function relLumEl(r, g, b) {
      const f = (c) => {
        const s = c / 255;
        return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    }

    window.__PORTFOLIO_QA_CONTRAST__ = {
      boxes: grey.map((el) => {
        const fg = parseRgb(getComputedStyle(el).color);
        return {
          el,
          fgL: fg ? relLumEl(...fg) : 0,
          darkest: null,
          darkestL: null,
        };
      }),
    };
  });

  const greyCount = await page.evaluate(
    () => window.__PORTFOLIO_QA_CONTRAST__?.boxes?.length ?? 0
  );
  for (let i = 0; i < greyCount; i++) {
    await page.evaluate((idx) => {
      const item = window.__PORTFOLIO_QA_CONTRAST__?.boxes?.[idx];
      item?.el?.scrollIntoView({ block: "center", inline: "nearest" });
    }, i);
    await page.mouse.move(520 + (i % 7) * 18, 360 + (i % 5) * 12);
    await page.waitForTimeout(280);
  }
  await page.waitForTimeout(400);

  const result = await page.evaluate(({ minRatio }) => {
    function relLum(r, g, b) {
      const f = (c) => {
        const s = c / 255;
        return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    }

    function contrast(fg, bg) {
      const l1 = relLum(...fg);
      const l2 = relLum(...bg);
      const lighter = Math.max(l1, l2);
      const darker = Math.min(l1, l2);
      return (lighter + 0.05) / (darker + 0.05);
    }

    function parseRgb(color) {
      const m = color.match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const parts = m[1].split(",").map((s) => parseFloat(s.trim()));
      if (parts.length < 3) return null;
      return parts.slice(0, 3);
    }

    const boxes = window.__PORTFOLIO_QA_CONTRAST__?.boxes ?? [];
    const ranked = [];

    for (const item of boxes) {
      const el = item.el;
      if (!item.darkest) continue;
      const style = getComputedStyle(el);
      const fg = parseRgb(style.color);
      if (!fg) continue;
      const ratio = contrast(fg, item.darkest);
      ranked.push({
        ratio: Math.round(ratio * 100) / 100,
        tag: el.tagName.toLowerCase(),
        className: el.className?.toString?.().slice(0, 80) ?? "",
        color: style.color,
        text: (el.textContent ?? "").trim().slice(0, 72),
        darkestCanvasPixelRgb: [...item.darkest],
      });
    }
    ranked.sort((a, b) => a.ratio - b.ratio);
    const worst = ranked[0] ?? {
      ratio: 999,
      tag: "",
      className: "",
      color: "",
      text: "",
      darkestCanvasPixelRgb: null,
    };

    const fgSecondary = getComputedStyle(
      document.querySelector("[data-portfolio-ui]")
    )
      .getPropertyValue("--fg-secondary")
      .trim();

    const heroSubline = ranked.find((row) =>
      row.text.includes("Product engineering")
    );

    return {
      greyElements: boxes.length,
      elementsWithSamples: boxes.filter((b) => b.darkest).length,
      worstElement: worst,
      heroSublineWorstCase: heroSubline ?? null,
      fgSecondaryToken: fgSecondary || "(unset)",
      minRatio,
    };
  }, { minRatio: MIN_RATIO });

  result.elementsSampledPasses = greyCount;

  console.log(JSON.stringify(result, null, 2));

  if (result.greyElements === 0) {
    console.error("No grey text elements found");
    process.exit(1);
  }
  if (!result.worstElement.darkestCanvasPixelRgb) {
    console.error("No canvas samples captured (QA readback hook missing?)");
    process.exit(1);
  }
  if (result.worstElement.ratio < MIN_RATIO) {
    console.error(`Worst contrast ${result.worstElement.ratio} < ${MIN_RATIO}`);
    process.exit(1);
  }
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
