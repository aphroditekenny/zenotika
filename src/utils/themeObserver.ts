type ThemeCallback = (theme: string) => void;

let currentTheme: string | null = null;
let observer: MutationObserver | null = null;
const listeners = new Set<ThemeCallback>();

export function onThemeChange(cb: ThemeCallback) {
  listeners.add(cb);
  if (!observer && typeof document !== 'undefined') {
    currentTheme = document.documentElement.getAttribute('data-theme');
    observer = new MutationObserver(() => {
      const next = document.documentElement.getAttribute('data-theme') || 'light';
      if (next !== currentTheme) {
        currentTheme = next;
        listeners.forEach(l => l(next));
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }
  return () => listeners.delete(cb);
}

export function getCurrentTheme() {
  return document.documentElement.getAttribute('data-theme') || 'light';
}