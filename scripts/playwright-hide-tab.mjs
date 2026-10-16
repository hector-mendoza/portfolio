/** Hide a page the same way scene-qa-gate does (second tab or visibility fallback). */
export async function hideViaSecondTab(context, page) {
  const blank = await context.newPage();
  await blank.goto("about:blank");
  await page.waitForTimeout(800);
  const visibilityState = await page.evaluate(() => document.visibilityState);
  if (visibilityState === "hidden") {
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
