import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Metric } from "web-vitals";

const registers = {
  onCLS: vi.fn(),
  onFID: vi.fn(),
  onLCP: vi.fn(),
  onINP: vi.fn(),
  onTTFB: vi.fn(),
};

vi.mock("web-vitals", () => registers);
vi.mock("@vercel/speed-insights", () => ({
  trackWebVitals: vi.fn(),
}));

const flushAsync = () => new Promise<void>((resolve) => {
  setTimeout(resolve, 0);
});

describe("performance metrics", () => {
  let resetPerformanceMetrics: (() => void) | undefined;
  let consoleDebugSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleDebugSpy = vi.spyOn(console, "debug").mockImplementation(() => {});
  });

  afterEach(async () => {
    Object.values(registers).forEach((fn) => fn.mockClear());
    resetPerformanceMetrics?.();
    resetPerformanceMetrics = undefined;
    consoleDebugSpy.mockRestore();
    vi.unstubAllEnvs();
    await vi.resetModules();
  });

  it("registers listeners only once", async () => {
    const {
      initPerformanceMetrics,
      resetPerformanceMetricsForTesting,
    } = await import("../utils/performanceMetrics");

    resetPerformanceMetrics = resetPerformanceMetricsForTesting;

    await initPerformanceMetrics();
    await initPerformanceMetrics();

    expect(registers.onCLS).toHaveBeenCalledTimes(1);
    expect(registers.onFID).toHaveBeenCalledTimes(1);
    expect(registers.onLCP).toHaveBeenCalledTimes(1);
    expect(registers.onINP).toHaveBeenCalledTimes(1);
    expect(registers.onTTFB).toHaveBeenCalledTimes(1);
  });

  it("allows re-initialisation after reset", async () => {
    const {
      initPerformanceMetrics,
      resetPerformanceMetricsForTesting,
    } = await import("../utils/performanceMetrics");

    resetPerformanceMetrics = resetPerformanceMetricsForTesting;

    await initPerformanceMetrics();
    resetPerformanceMetricsForTesting();
    await initPerformanceMetrics();

    expect(registers.onCLS).toHaveBeenCalledTimes(2);
    expect(registers.onFID).toHaveBeenCalledTimes(2);
    expect(registers.onLCP).toHaveBeenCalledTimes(2);
    expect(registers.onINP).toHaveBeenCalledTimes(2);
    expect(registers.onTTFB).toHaveBeenCalledTimes(2);
  });

  it("records metrics through the performance collector", async () => {
    vi.stubEnv("VITE_ENABLE_PERF_METRICS", "true");
    const {
      initPerformanceMetrics,
      resetPerformanceMetricsForTesting,
    } = await import("../utils/performanceMetrics");
    const { performanceCollector } = await import("../utils/performanceCollector");

    resetPerformanceMetrics = resetPerformanceMetricsForTesting;

    await initPerformanceMetrics();
    const reporter = registers.onCLS.mock.calls[0]?.[0] as ((metric: Metric) => void) | undefined;
    expect(typeof reporter).toBe("function");

    const sampleMetric: Metric = {
      name: "CLS",
      value: 0.02,
      delta: 0.02,
      id: "test",
      rating: "good",
      entries: [],
    } as Metric;

    reporter?.(sampleMetric);
    expect(performanceCollector.getMetricsByName("CLS")).toHaveLength(1);
  });

  it("forwards metrics to the monitoring provider when enabled", async () => {
    vi.stubEnv("VITE_ENABLE_PERF_METRICS", "true");
    vi.stubEnv("VITE_ENABLE_MONITORING", "true");

    const {
      initPerformanceMetrics,
      resetPerformanceMetricsForTesting,
    } = await import("../utils/performanceMetrics");

    resetPerformanceMetrics = resetPerformanceMetricsForTesting;

    await initPerformanceMetrics();
    const reporter = registers.onCLS.mock.calls[0]?.[0] as ((metric: Metric) => void) | undefined;
    const metric: Metric = {
      name: "CLS",
      value: 0.03,
      delta: 0.01,
      id: "monitor",
      rating: "good",
      entries: [],
    } as Metric;

    reporter?.(metric);
    await flushAsync();

    const { trackWebVitals } = (await import(
      "@vercel/speed-insights",
    )) as unknown as {
      trackWebVitals: ReturnType<typeof vi.fn>;
    };
    expect(trackWebVitals).toHaveBeenCalledWith(metric);
  });
});
