import { describe, expect, it, vi } from "vitest";
import type { Metric } from "web-vitals";
import { PerformanceCollector } from "../utils/performanceCollector";

describe("PerformanceCollector", () => {
  const sampleMetric: Metric = {
    name: "LCP",
    value: 1234,
    delta: 0,
    id: "abc",
    rating: "good",
    entries: [],
  } as Metric;

  it("stores metrics and returns them", () => {
    const collector = new PerformanceCollector();
    collector.record(sampleMetric);

    expect(collector.getMetrics()).toHaveLength(1);
    expect(collector.getMetricsByName("LCP")).toHaveLength(1);
    expect(collector.getMetricsByName("CLS")).toHaveLength(0);
  });

  it("notifies subscribers and allows unsubscribe", () => {
    const collector = new PerformanceCollector();
    const listener = vi.fn();
    const unsubscribe = collector.subscribe(listener);

    collector.record(sampleMetric);
    expect(listener).toHaveBeenCalledWith(sampleMetric);

    unsubscribe();
    collector.record({ ...sampleMetric, value: 2222 });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("resets stored state", () => {
    const collector = new PerformanceCollector();
    collector.record(sampleMetric);
    collector.reset();

    expect(collector.getMetrics()).toHaveLength(0);
    const listener = vi.fn();
    collector.subscribe(listener);
    collector.record(sampleMetric);
    expect(listener).toHaveBeenCalled();
  });
});
