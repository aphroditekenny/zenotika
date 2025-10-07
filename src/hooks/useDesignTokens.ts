import { useEffect, useState } from "react";

interface TokenGroup {
  [key: string]: string | TokenGroup;
}

export interface DesignTokens {
  color: TokenGroup;
  spacing: TokenGroup;
  motion: TokenGroup;
}

// Lazy load the JSON so it doesn't bloat initial bundle significantly.
export function useDesignTokens() {
  const [tokens, setTokens] = useState<DesignTokens | null>(null);
  useEffect(() => {
    let mounted = true;
    import("../styles/tokens/design-tokens.json")
      .then(mod => {
        if (mounted) setTokens(mod as unknown as DesignTokens);
      })
      .catch(() => {
        // Swallow; tokens non-essential runtime.
      });
    return () => { mounted = false; };
  }, []);
  return tokens;
}

// Helper to read a CSS variable directly (runtime theme aware)
export function getCssVar(name: string, fallback?: string) {
  if (typeof window === 'undefined') return fallback ?? '';
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback || '';
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return reduced;
}

// Gate an animation callback respecting reduced motion & explicit override
export function runAnimation(respectMotion: boolean, cb: () => void) {
  if (respectMotion && typeof window !== 'undefined') {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) return; // Skip heavy animation
  }
  cb();
}
