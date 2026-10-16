/** Playwright addInitScript body: count native window.requestAnimationFrame calls. */
export const NATIVE_RAF_COUNTER_INIT = String.raw`
(() => {
  const native = window.requestAnimationFrame.bind(window);
  let count = 0;
  window.__nativeRafCount = 0;
  window.requestAnimationFrame = function (cb) {
    count += 1;
    window.__nativeRafCount = count;
    return native(cb);
  };
})();
`;

export async function sampleNativeRafDelta(page, ms) {
  await page.evaluate(() => {
    globalThis.__nativeRafSampleStart = window.__nativeRafCount ?? 0;
  });
  await page.waitForTimeout(ms);
  return page.evaluate((sampleMs) => ({
    start: globalThis.__nativeRafSampleStart ?? 0,
    end: window.__nativeRafCount ?? 0,
    delta: (window.__nativeRafCount ?? 0) - (globalThis.__nativeRafSampleStart ?? 0),
    perSec:
      (((window.__nativeRafCount ?? 0) - (globalThis.__nativeRafSampleStart ?? 0)) * 1000) /
      sampleMs,
  }), ms);
}
