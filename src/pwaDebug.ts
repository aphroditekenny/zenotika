let fire: ((waiting?: ServiceWorker) => void) | null = null;

export function registerUpdateToastCallback(callback: (waiting?: ServiceWorker) => void) {
  fire = callback;
}

export function triggerUpdateToast(waiting?: ServiceWorker) {
  fire?.(waiting);
}
