import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react';

type Theme = 'light' | 'dark';
type TimePhase = 'dawn' | 'day' | 'dusk' | 'night';
type ThemeMode = 'manual' | 'auto';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
  isLight: boolean;
  phase: TimePhase;           // time-of-day derived phase
  mode: ThemeMode;            // auto vs manual
  setMode: (m: ThemeMode) => void;
  refreshPhase: () => void;   // force re-evaluation (used if user changes system clock)
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const applyThemeClass = (theme: Theme, phase: TimePhase) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.remove('light', 'dark', 'day-mode', 'phase-dawn', 'phase-day', 'phase-dusk', 'phase-night');
  if (theme === 'light') {
    root.classList.add('light', 'day-mode');
  } else {
    root.classList.add('dark');
  }
  root.classList.add(`phase-${phase}`);
  root.setAttribute('data-time-phase', phase);
};

const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') {
    return 'dark';
  }

  try {
    const stored = window.localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  } catch {
    // ignore storage access issues and fall back to system preference
  }

  const prefersDark = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)').matches : false;
  return prefersDark ? 'dark' : 'light';
};

function computePhase(date = new Date()): TimePhase {
  const h = date.getHours();
  if (h < 5) return 'night';
  if (h < 9) return 'dawn';
  if (h < 17) return 'day';
  if (h < 20) return 'dusk';
  return 'night';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('auto');
  const [phase, setPhase] = useState<TimePhase>(() => computePhase());
  const [theme, setTheme] = useState<Theme>(() => {
    const initialTheme = getInitialTheme();
    applyThemeClass(initialTheme, phase);
    return initialTheme;
  });

  // Keep theme in sync with system preference when user hasn't explicitly chosen.
  // Auto mode: react to system color scheme and clock progression
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleScheme = (event: MediaQueryListEvent) => {
      if (mode !== 'auto') return;
      setTheme(event.matches ? 'dark' : 'light');
    };
    media.addEventListener('change', handleScheme);
    return () => media.removeEventListener('change', handleScheme);
  }, [mode]);

  // Recompute phase periodically (every 10 minutes) in auto mode
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (mode !== 'auto') return;
    let raf: number | null = null;
    let timer: number | null = null;
    const tick = () => {
      const next = computePhase();
      setPhase(p => (p === next ? p : next));
      timer = window.setTimeout(schedule, 600000); // 10 minutes
    };
    const schedule = () => { raf = requestAnimationFrame(tick); };
    schedule();
    return () => { if (raf) cancelAnimationFrame(raf); if (timer) clearTimeout(timer); };
  }, [mode]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    applyThemeClass(theme, phase);

    try {
      window.localStorage.setItem('theme', theme);
    } catch {
      // ignore storage failures (private mode, etc.)
    }

    // Update or create meta theme-color for mobile browsers
    const updateThemeMeta = () => {
      let metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (!metaThemeColor) {
        metaThemeColor = document.createElement('meta');
        metaThemeColor.setAttribute('name', 'theme-color');
        document.head.appendChild(metaThemeColor);
      }
      // Use semantic CSS variables where possible; fallback to existing brand shades
      // Night meta aims for a deep navy blend; light uses the indigo-light brand.
  const styles = getComputedStyle(document.documentElement);
  const darkColor = styles.getPropertyValue('--color-meta-theme-dark').trim() || styles.getPropertyValue('--color-brand-night-bg2').trim() || '#1a1b3e';
  const lightColor = styles.getPropertyValue('--color-meta-theme-light').trim() || styles.getPropertyValue('--color-brand-indigo-light').trim();
      metaThemeColor.setAttribute('content', theme === 'dark' ? darkColor : lightColor);
    };

    updateThemeMeta();
  }, [theme, phase]);

  const toggleTheme = () => {
    setMode('manual');
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const refreshPhase = () => setPhase(computePhase());

  const value: ThemeContextType = useMemo(() => ({
    theme,
    toggleTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
    phase,
    mode,
    setMode,
    refreshPhase
  }), [theme, phase, mode]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}