export type FeatureFlagKey =
  | "lazyHomePage"
  | "lazyHomeSections"
  | "performanceMetrics"
  | "analytics"
  | "monitoring"
  | "pwa";

const truthy = new Set(["true", "1", "yes"]);

const env = import.meta.env as Record<string, string | boolean | undefined>;

const featureFlagValues: Record<FeatureFlagKey, boolean> = {
  lazyHomePage: truthy.has(String(env.VITE_ENABLE_LAZY_HOME_PAGE ?? "").toLowerCase()),
  lazyHomeSections: truthy.has(String(env.VITE_ENABLE_LAZY_HOME_SECTIONS ?? "").toLowerCase()),
  performanceMetrics: truthy.has(String(env.VITE_ENABLE_PERF_METRICS ?? "").toLowerCase()),
  analytics: truthy.has(String(env.VITE_ENABLE_ANALYTICS ?? "").toLowerCase()),
  monitoring: truthy.has(String(env.VITE_ENABLE_MONITORING ?? "").toLowerCase()),
  pwa: truthy.has(String(env.VITE_ENABLE_PWA ?? "").toLowerCase()),
};

const overrides: Partial<Record<FeatureFlagKey, boolean>> = {};

export const featureFlags = Object.freeze(featureFlagValues);

export function isFeatureEnabled(flag: FeatureFlagKey): boolean {
  if (flag in overrides) {
    return Boolean(overrides[flag]);
  }
  return featureFlags[flag];
}

export function __setFeatureFlagOverride(flag: FeatureFlagKey, value: boolean) {
  overrides[flag] = value;
}

export function __resetFeatureFlagOverrides() {
  Object.keys(overrides).forEach((key) => {
    delete overrides[key as FeatureFlagKey];
  });
}
