import type { Metric } from "web-vitals";

type MetricListener = (metric: Metric) => void;

export class PerformanceCollector {
  private metrics = new Map<string, Metric[]>();
  private listeners = new Set<MetricListener>();

  record(metric: Metric) {
    const existing = this.metrics.get(metric.name) ?? [];
    existing.push(metric);
    this.metrics.set(metric.name, existing);

    if (this.listeners.size > 0) {
      this.listeners.forEach((listener) => {
        try {
          listener(metric);
        } catch (error) {
          if (import.meta.env.DEV) {
            // eslint-disable-next-line no-console
            console.warn("perf listener error", error);
          }
        }
      });
    }
  }

  getMetrics(): Metric[] {
    return Array.from(this.metrics.values()).flat();
  }

  getMetricsByName(name: string): Metric[] {
    return [...(this.metrics.get(name) ?? [])];
  }

  subscribe(listener: MetricListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  reset() {
    this.metrics.clear();
    this.listeners.clear();
  }
}

export const performanceCollector = new PerformanceCollector();
