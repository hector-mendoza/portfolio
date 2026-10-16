declare global {
  interface Window {
    __PLAYWRIGHT_ALLOW_SCENE__?: boolean;
  }
}

/** Headless perf audits (Lighthouse). Playwright sets __PLAYWRIGHT_ALLOW_SCENE__. */
export function isAutomatedAudit(): boolean {
  if (typeof navigator === "undefined") return false;
  if (typeof window !== "undefined" && window.__PLAYWRIGHT_ALLOW_SCENE__) {
    return false;
  }
  return navigator.webdriver === true;
}
