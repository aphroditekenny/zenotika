import { useEffect, useRef } from 'react';

/**
 * usePrefetchOnIntent
 * Triggers a provided prefetch function when the user shows intent:
 *  - hover or focus on the supplied ref element
 *  - element enters the viewport (IntersectionObserver threshold)
 * Prefetch fires only once.
 */
export function usePrefetchOnIntent<T extends HTMLElement>(options: {
  ref: React.RefObject<T>;
  prefetch: () => void | Promise<unknown>;
  rootMargin?: string;
  threshold?: number;
}) {
  const firedRef = useRef(false);

  useEffect(() => {
    const el = options.ref.current;
    if (!el) return;

    const fire = () => {
      if (firedRef.current) return;
      firedRef.current = true;
      try { options.prefetch(); } catch { /* noop */ }
    };

    const onPointer = () => fire();
    el.addEventListener('pointerenter', onPointer, { passive: true });
    el.addEventListener('focus', onPointer, { passive: true });

    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            fire();
            observer && observer.disconnect();
            break;
          }
        }
      }, { root: null, rootMargin: options.rootMargin ?? '200px', threshold: options.threshold ?? 0 });
      observer.observe(el);
    } else {
      // Fallback: prefetch after a short idle timeout if IO not available (e.g., test env)
      const t = setTimeout(fire, 50);
      return () => clearTimeout(t);
    }

    return () => {
      el.removeEventListener('pointerenter', onPointer);
      el.removeEventListener('focus', onPointer);
      observer && observer.disconnect();
    };
  }, [options]);
}

export default usePrefetchOnIntent;
