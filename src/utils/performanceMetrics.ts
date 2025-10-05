import type { Metric } from "web-vitals";
import { isFeatureEnabled } from "../featureFlags";
import { performanceCollector } from "./performanceCollector";

const metaEnv = import.meta.env as Record<string, unknown>;
const isDev = Boolean((metaEnv.DEV as boolean | undefined) ?? false);

export type MetricReporter = (metric: Metric) => void;

let initialized = false;
let preloadPromise: Promise<typeof import("web-vitals")> | null = null;
let monitoringModulePromise: Promise<typeof import("@vercel/speed-insights")> | null = null;

async function reportToMonitoring(metric: Metric) {
  if (!isFeatureEnabled("monitoring") || typeof window === "undefined") {
    return;
  }

  if (!monitoringModulePromise) {
    monitoringModulePromise = import("@vercel/speed-insights");
  }

  try {
    const module = await monitoringModulePromise;
    const track = (module as { trackWebVitals?: (metric: Metric) => void })
      .trackWebVitals;

    if (typeof track === "function") {
      track(metric);
    }
  } catch (error) {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.warn("speed-insights reporting failed", error);
    }
  }
}

const defaultReporter: MetricReporter = (metric) => {
  performanceCollector.record(metric);

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("perf-metric", { detail: metric })
    );
  }

  void reportToMonitoring(metric);

  if (isDev) {
    // eslint-disable-next-line no-console
    console.debug(`[perf] ${metric.name}`, metric);
  }
};

function loadWebVitals() {
  if (!preloadPromise) {
    preloadPromise = import("web-vitals");
  }
  return preloadPromise;
}

export async function initPerformanceMetrics(options?: {
  reporter?: MetricReporter;
}): Promise<void> {
  if (initialized) return;
  initialized = true;

  const { onCLS, onFID, onLCP, onINP, onTTFB } = await loadWebVitals();
  const reporter = options?.reporter ?? defaultReporter;
  const registrations = [onCLS, onFID, onLCP, onINP, onTTFB];
  registrations.forEach((register) => register(reporter));
}

export function preloadPerformanceMetrics(): Promise<typeof import("web-vitals")> {
  return loadWebVitals();
}

export function resetPerformanceMetricsForTesting() {
  initialized = false;
  preloadPromise = null;
  monitoringModulePromise = null;
  performanceCollector.reset();
}
