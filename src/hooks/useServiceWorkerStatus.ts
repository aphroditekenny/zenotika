import { useEffect, useState } from 'react';

interface SWStatus {
  offline: boolean;
  waiting: boolean;
  refreshing: boolean;
  update(): void;
}

/**
 * Tracks service worker lifecycle and offline state.
 * Non-invasive: safe if no service worker is registered.
 */
export function useServiceWorkerStatus(): SWStatus {
  const [offline, setOffline] = useState(!navigator.onLine);
  const [waiting, setWaiting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    let cancelled = false;

    navigator.serviceWorker.getRegistration().then((reg) => {
      if (cancelled || !reg) return;
      if (reg.waiting) setWaiting(true);
      reg.addEventListener('updatefound', () => {
        const installing = reg.installing;
        if (installing) {
          installing.addEventListener('statechange', () => {
            if (installing.state === 'installed' && navigator.serviceWorker.controller) {
              setWaiting(true);
            }
          });
        }
      });
    });

    const handler = () => {
      setRefreshing(false);
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener('controllerchange', handler);

    return () => {
      cancelled = true;
      navigator.serviceWorker.removeEventListener('controllerchange', handler);
    };
  }, []);

  const update = () => {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.getRegistration().then((reg) => {
      if (!reg) return;
      const w = reg.waiting;
      if (w) {
        setRefreshing(true);
        w.postMessage({ type: 'SKIP_WAITING' });
      }
    });
  };

  return { offline, waiting, refreshing, update };
}
