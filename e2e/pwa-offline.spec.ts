import { expect, test } from "@playwright/test";

const shouldRunPwaE2E = process.env.E2E_PWA === "true";

test.describe("pwa offline resilience", () => {
  test.skip(!shouldRunPwaE2E, "PWA e2e suite runs only when E2E_PWA=true");

  test("serves offline fallback and surfaces update toast", async ({ page, context }) => {
    await page.goto("/");
    await page.waitForLoadState("load");

    await page.evaluate(async () => {
      if (!("serviceWorker" in navigator)) {
        throw new Error("Service workers unavailable");
      }
      await navigator.serviceWorker.register("/sw.js");
    });
    await page.waitForTimeout(500);
    await page.reload();
    await page.waitForLoadState("load");

    await page.waitForFunction(
      () => typeof navigator !== "undefined" && !!navigator.serviceWorker?.controller,
      undefined,
      { timeout: 30_000 },
    );

    const cachedKeys = await page.evaluate(async () => {
      const keys = await caches.keys();
      const entries = await Promise.all(
        keys.map(async (key) => {
          const cache = await caches.open(key);
          const requests = await cache.keys();
          return { key, urls: requests.map((r) => r.url) };
        }),
      );
      return entries;
    });
    console.log("Cache contents", JSON.stringify(cachedKeys, null, 2));
    const offlineMatch = await page.evaluate(async () => {
      const res = await caches.match("/offline.html");
      return !!res;
    });
    console.log("Has offline cache match?", offlineMatch);

    await context.setOffline(true);
    await page.reload({ waitUntil: "domcontentloaded" });
    const offlineHtml = await page.content();
    console.log("Offline page HTML snippet:\n", offlineHtml.slice(0, 2000));
    await expect(page.getByRole("heading", { name: /offline/i })).toBeVisible();
    await context.setOffline(false);

    await page.goto("/");
    await page.waitForLoadState("load");
    await page.waitForFunction(() => (window as typeof window & { __PWA_DEBUG_READY?: boolean }).__PWA_DEBUG_READY === true);

    await page.evaluate(() => {
      const fakeWaiting = {
        state: "installed" as ServiceWorkerState,
        scriptURL: `${location.origin}/sw.js`,
        postMessage: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
        onstatechange: null,
      } as unknown as ServiceWorker;

      const anyWindow = window as typeof window & { __PWA_DEBUG_TOAST?: (waiting?: ServiceWorker) => void };
      if (typeof anyWindow.__PWA_DEBUG_TOAST === "function") {
        anyWindow.__PWA_DEBUG_TOAST(fakeWaiting);
      } else {
        window.dispatchEvent(new CustomEvent("pwa:debug-update-toast", { detail: fakeWaiting }));
      }
    });

    await page.waitForFunction(() =>
      Array.from(document.querySelectorAll('[data-sonner-toaster]')).length > 0,
    );

    const toast = page.getByText(/new content available/i);
    await expect(toast).toBeVisible();
  await expect(page.getByRole("button", { name: /refresh/i })).toBeVisible();
  });
});
