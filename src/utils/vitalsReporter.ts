import type { Metric } from 'web-vitals';
import { performanceCollector } from './performanceCollector';
import { isFeatureEnabled } from '../featureFlags';

let initialized = false;
let flushTimer: number | null = null;
const queue: Metric[] = [];
const logDevWarning = (message: string, error: unknown) => {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.warn(message, error);
  }
};
const sessionId = (() => {
  try {
    const k = 'zenotikaSessionId';
    const existing = sessionStorage.getItem(k);
    if (existing) return existing;
    const v = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem(k, v);
    return v;
  } catch (error) {
    logDevWarning('Failed to initialise vitals session ID; using anonymous session', error);
    return 'anon';
  }
})();

function flush() {
  if (!queue.length) return;
  const batch = queue.splice(0, queue.length);
  const payload = JSON.stringify({ sessionId, metrics: batch.map(m => ({
    name: m.name,
    value: m.value,
    id: m.id,
    delta: m.delta,
    rating: (m as any).rating,
    navigationType: (m as any).navigationType,
    ts: Date.now()
  })) });
  const url = '/.netlify/functions/collect-vitals';
  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' });
      navigator.sendBeacon(url, blob);
    } else {
      void fetch(url, { method: 'POST', body: payload, headers: { 'content-type': 'application/json' } });
    }
  } catch (error) {
    logDevWarning('Vitals reporter beacon failed', error);
  }
}

function scheduleFlush(delay = 5000) {
  if (flushTimer !== null) window.clearTimeout(flushTimer);
  flushTimer = window.setTimeout(() => {
    flush();
  }, delay);
}

export function initVitalsReporter() {
  if (initialized) return;
  if (!isFeatureEnabled('performanceMetrics')) return;
  initialized = true;
  performanceCollector.subscribe(m => {
    queue.push(m);
    if (queue.length >= 10) {
      flush();
    } else {
      scheduleFlush();
    }
  });
  // safety flush on page hide
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush();
  });
  window.addEventListener('beforeunload', () => flush());
}
