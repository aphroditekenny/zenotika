const STORAGE_KEY = 'zen.theme';
type Theme = 'day' | 'night';

function systemTheme(): Theme {
  try { return window.matchMedia('(prefers-color-scheme: light)').matches ? 'day' : 'night'; } catch { return 'night'; }
}

export function getInitialTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored === 'day' || stored === 'night') return stored;
  } catch {}
  return systemTheme();
}

export function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
  try { localStorage.setItem(STORAGE_KEY, theme); } catch {}
}

export function toggleTheme() {
  const current = (document.documentElement.getAttribute('data-theme') as Theme) || getInitialTheme();
  const next: Theme = current === 'night' ? 'day' : 'night';
  applyTheme(next);
  return next;
}

// Expose for debugging / imperative access.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).__zenTheme = { apply: applyTheme, toggle: toggleTheme, current: () => document.documentElement.getAttribute('data-theme') };

if (!document.documentElement.hasAttribute('data-theme')) {
  applyTheme(getInitialTheme());
}