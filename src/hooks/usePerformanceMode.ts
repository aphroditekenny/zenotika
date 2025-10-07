import { useEffect } from 'react';

/**
 * usePerformanceMode
 * Detects low-end / constrained environments (save-data, low memory, few cores)
 * and applies a `reduced-perf` class to <html>. CSS can then disable heavy
 * visual effects (blur, large animations, parallax) for mobile performance wins.
 */
export function usePerformanceMode() {
  useEffect(() => {
    try {
      const nav = navigator as any;
      const conn = nav.connection || nav.mozConnection || nav.webkitConnection;
      const saveData: boolean = !!conn?.saveData;
      const downlink = Number(conn?.downlink) || 0;
      const deviceMemory = (nav as any).deviceMemory || 0; // Chrome only
      const cores = navigator.hardwareConcurrency || 0;

      const isLowEnd = (
        saveData ||
        deviceMemory > 0 && deviceMemory <= 3 ||
        cores > 0 && cores <= 4 ||
        downlink > 0 && downlink < 2
      );

      if (isLowEnd) {
        document.documentElement.classList.add('reduced-perf');
      } else {
        document.documentElement.classList.remove('reduced-perf');
      }
    } catch {
      // Non‑critical; swallow
    }
  }, []);
}
