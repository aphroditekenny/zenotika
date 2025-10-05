import { afterEach, describe, expect, it, vi } from "vitest";

const importHomePage = () => import("../components/HomePage");

describe("HomePage lazy sections", () => {
  afterEach(async () => {
    vi.unstubAllEnvs();
    await vi.resetModules();
  });

  it("preloads sections when lazy loading is enabled", async () => {
    vi.stubEnv("VITE_ENABLE_LAZY_HOME_SECTIONS", "true");
    const mod = await importHomePage();
    const modules = await mod.preloadHomeSections();

    expect(modules).toHaveLength(3);
    modules.forEach((module) => {
      expect(module).toHaveProperty("default");
    });
  });

  it("resolves immediately without extra imports when lazy loading is disabled", async () => {
    const mod = await importHomePage();
    const quoteSpy = vi.spyOn(mod, "loadQuoteSectionModule");
    const preloadResult = await mod.preloadHomeSections();

    expect(quoteSpy).not.toHaveBeenCalled();
    expect(preloadResult).toEqual([]);
  });
});
