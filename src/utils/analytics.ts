// Lightweight analytics abstraction. In production you can swap implementation.
// Usage: track('event_name', { optional: 'payload' })
// Intentionally tiny to avoid vendor lock & keep bundle lean.

export type AnalyticsEvent =
  | 'menu_open'
  | 'menu_close'
  | 'theme_toggle'
  | 'resume_hunt'
  | 'breadcrumb_click'
  | 'pwa_update_trigger'
  | 'pwa_refresh'
  | string;

interface AnalyticsOptions {
  debug?: boolean;
  transport?: (name: string, payload?: Record<string, unknown>) => void;
}

let _options: AnalyticsOptions = { debug: !!import.meta.env.DEV };

export function configureAnalytics(options: AnalyticsOptions) {
  _options = { ..._options, ...options };
}

export function track(name: AnalyticsEvent, payload?: Record<string, unknown>) {
  try {
    const record = { name, ts: Date.now(), ...(payload || {}) };
    if (_options.transport) {
      _options.transport(name, record);
    } else if (_options.debug) {
      // eslint-disable-next-line no-console
      console.debug('[analytics]', record);
    }
    (window as any).__ZEN_ANALYTICS_LAST = record; // simple debugging handle
  } catch (e) {
    if (_options.debug) {
      // eslint-disable-next-line no-console
      console.warn('[analytics][error]', e);
    }
  }
}
