import { afterEach, describe, expect, it, vi } from "vitest";

const importFlags = () => import("../featureFlags");

describe("feature flags", () => {
  afterEach(async () => {
    vi.unstubAllEnvs();
    await vi.resetModules();
  });

  it("are disabled by default", async () => {
    await vi.resetModules();
    const { featureFlags } = await importFlags();

    expect(featureFlags.lazyHomePage).toBe(false);
    expect(featureFlags.lazyHomeSections).toBe(false);
    expect(featureFlags.performanceMetrics).toBe(false);
    expect(featureFlags.analytics).toBe(false);
    expect(featureFlags.monitoring).toBe(false);
    expect(featureFlags.pwa).toBe(false);
  });

  it("activate when corresponding environment variables are truthy", async () => {
    vi.stubEnv("VITE_ENABLE_LAZY_HOME_PAGE", "true");
    vi.stubEnv("VITE_ENABLE_LAZY_HOME_SECTIONS", "true");
    vi.stubEnv("VITE_ENABLE_PERF_METRICS", "1");
    vi.stubEnv("VITE_ENABLE_ANALYTICS", "yes");
    vi.stubEnv("VITE_ENABLE_MONITORING", "true");
    vi.stubEnv("VITE_ENABLE_PWA", "true");

    await vi.resetModules();
    const { featureFlags } = await importFlags();

    expect(featureFlags.lazyHomePage).toBe(true);
    expect(featureFlags.lazyHomeSections).toBe(true);
    expect(featureFlags.performanceMetrics).toBe(true);
    expect(featureFlags.analytics).toBe(true);
    expect(featureFlags.monitoring).toBe(true);
    expect(featureFlags.pwa).toBe(true);
  });

  it("allows overriding flags for tests", async () => {
    await vi.resetModules();
    const {
      isFeatureEnabled,
      __setFeatureFlagOverride,
      __resetFeatureFlagOverrides,
    } = await importFlags();

    expect(isFeatureEnabled("lazyHomeSections")).toBe(false);
    __setFeatureFlagOverride("lazyHomeSections", true);
    expect(isFeatureEnabled("lazyHomeSections")).toBe(true);

    __resetFeatureFlagOverrides();
    expect(isFeatureEnabled("lazyHomeSections")).toBe(false);
  });
});
