import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from './useDesignTokens';
import { animationRegistry } from '../utils/animationRegistry';
import { onThemeChange, getCurrentTheme } from '../utils/themeObserver';

interface UseLottieOptions {
  id: string;               // Unique ID for registry
  src: string;              // Path/URL to Lottie JSON
  loop?: boolean;
  autoplay?: boolean;
  reduceMotionAware?: boolean; // Skip if prefers-reduced-motion
  intersectionRootMargin?: string;
  speed?: number;           // initial speed
  onLoad?(): void;
  onError?(err: unknown): void;
  respectPerfBudget?: boolean; // Auto pause if frame budget exceeded
  // Advanced (Phase 2):
  colorRemap?: Record<string, string>; // map original hex -> new hex (both #rrggbb or #rgb)
  segments?: Array<[number, number]>;  // segment frame ranges
  segmentIndex?: number;               // which segment to auto-play
  preloadFonts?: boolean;              // attempt preload fonts defined in animation
  telemetry?: boolean;                 // send errors to Sentry if available
  useWorkerPreprocess?: boolean;       // offload fetch + preprocessing to a worker
  onLoopComplete?: () => void;
  onComplete?: () => void;
  onSegmentStart?: (segmentIndex: number) => void;
  adaptivePerformance?: boolean;       // degrade animation if heavy + low perf conditions
  gradientTokenMap?: Record<string, string[]>; // semantic token -> array of css var names for stops
  experimentalSimplify?: boolean;      // request worker simplification
  segmentLoop?: boolean;               // if true + segmentIndex provided, loop only that segment
}

// Heuristic perf budget: if average frame > 28ms over a 1s window, pause.
function createPerfMonitor(pause: () => void) {
  let frames = 0; let start = performance.now();
  function loop() {
    frames++;
    const now = performance.now();
    if (now - start >= 1000) {
      const avg = (now - start) / frames; // ms per frame
      if (avg > 28) pause();
      frames = 0; start = now;
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

export function useLottie(options: UseLottieOptions) {
  const {
    id,
    src,
    loop = true,
    autoplay = true,
    reduceMotionAware = true,
    intersectionRootMargin = '0px 0px -25% 0px',
    speed = 1,
    onLoad,
    onError,
    respectPerfBudget = true
  } = options;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = useReducedMotion();
  const lottieRef = useRef<any>(null);
  const visibleRef = useRef(false);
  const [ready, setReady] = useState(false);

  // Utility: hex -> normalized rgba array for Lottie [r,g,b,a]
  function hexToRGBA(hex: string): [number, number, number, number] {
    let h = hex.replace('#','');
    if (h.length === 3) h = h.split('').map(c=>c+c).join('');
    const num = parseInt(h,16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return [r/255, g/255, b/255, 1];
  }

  function applyColorRemap(data: any) {
    const mapping = options.colorRemap;
    if (!mapping) return data;
    const mapNorm: Record<string,[number,number,number,number]> = {};
    Object.entries(mapping).forEach(([from,to]) => { mapNorm[from.toLowerCase()] = hexToRGBA(to); });
    const visitShapes = (shapes: any[]) => {
      shapes?.forEach(s => {
        if (s.ty === 'fl' && s.c && Array.isArray(s.c.k)) {
          // Convert current color to hex for matching (approx)
          const [r,g,b] = s.c.k;
          const hex = '#' + [r,g,b].map(v=>{
            const val = Math.round(v*255); return val.toString(16).padStart(2,'0');
          }).join('');
          const target = mapNorm[hex.toLowerCase()];
          if (target) s.c.k = target;
        } else if ((s.ty === 'gf' || s.ty === 'gs') && s.g && s.g.k && s.g.k.k && Array.isArray(s.g.k.k)) {
          // Gradient fill/stroke: array is sequence of (pos, r, g, b, pos, r, g, b ...)
          const arr = s.g.k.k;
          for (let i = 0; i < arr.length - 3; i += 4) {
            const r = arr[i+1]; const g = arr[i+2]; const b = arr[i+3];
            const hex = '#' + [r,g,b].map(v=>{
              const val = Math.round(v*255); return val.toString(16).padStart(2,'0');
            }).join('');
            const target = mapNorm[hex.toLowerCase()];
            if (target) {
              arr[i+1] = target[0];
              arr[i+2] = target[1];
              arr[i+3] = target[2];
            }
          }
        } else if (s.it) {
          visitShapes(s.it);
        }
      });
    };
    data.layers?.forEach((l: any) => {
      if (l.shapes) visitShapes(l.shapes);
    });
    return data;
  }

  async function fetchAndProcess(): Promise<any | null> {
    try {
      if (options.useWorkerPreprocess && typeof Worker !== 'undefined') {
        const worker = new Worker(new URL('../workers/lottiePreprocess.worker.ts', import.meta.url), { type: 'module' });
        return await new Promise((resolve, reject) => {
          const timer = setTimeout(() => { worker.terminate(); reject(new Error('Worker timeout')); }, 10000);
          worker.onmessage = (e) => { clearTimeout(timer); resolve(e.data); worker.terminate(); };
          worker.onerror = (err) => { clearTimeout(timer); reject(err); };
          worker.postMessage({ src: options.src, colorRemap: options.colorRemap, simplify: options.experimentalSimplify });
        });
      }
      const res = await fetch(options.src);
      const json = await res.json();
      applyColorRemap(json);
      // Gradient token mapping: replace gradient stops with CSS variable resolved colors if provided
      if (options.gradientTokenMap && json.layers) {
        const getCss = (v: string) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
        json.layers.forEach((l: any) => {
          l.shapes?.forEach((s: any) => {
            if ((s.ty === 'gf' || s.ty === 'gs') && s.g && Array.isArray(s.g.k?.k)) {
              // Determine semantic key by first stop approximation (r,g,b)
              const stops = s.g.k.k;
              const semantic = Object.keys(options.gradientTokenMap!)[0]; // simple heuristic (future: detection)
              const tokenStops = semantic ? options.gradientTokenMap![semantic] : undefined;
              if (tokenStops && tokenStops.length >= 1) {
                // Map token stops in order to gradient stops (excluding position indices)
                for (let i=0, stopIdx=0; i < stops.length - 3 && stopIdx < tokenStops.length; i += 4, stopIdx++) {
                  const css = getCss(tokenStops[stopIdx]);
                  if (css) {
                    const rgb = css.match(/rgb[a]?\(([^)]+)\)/i);
                    if (rgb) {
                      const parts = rgb[1].split(',').map(p=> parseFloat(p.trim()));
                      if (parts.length >=3) {
                        stops[i+1] = (parts[0]/255);
                        stops[i+2] = (parts[1]/255);
                        stops[i+3] = (parts[2]/255);
                      }
                    }
                  }
                }
              }
            }
          });
        });
      }
      if (options.preloadFonts && json?.fonts?.list) {
        const promises: Promise<unknown>[] = [];
        json.fonts.list.forEach((f: any) => {
          if (f.fName && f.fFamily) {
            // Attempt CSS FontFaceSet load hint
            try { promises.push((document as any).fonts.load(`16px "${f.fFamily}"`)); } catch { /* ignore */ }
          }
        });
        void Promise.allSettled(promises);
      }
      return json;
    } catch (err) {
      if (options.telemetry && (import.meta as any).env?.VITE_SENTRY_DSN) {
        // Lazy import Sentry if configured
        import('@sentry/react').then(S => { S.captureException(err); }).catch(()=>{});
      }
      options.onError?.(err);
      return null;
    }
  }

  useEffect(() => {
    if (!containerRef.current) return;
    if (reduceMotionAware && reducedMotion) return; // Skip entirely
    let canceled = false;
    let unobserve: (() => void) | null = null;
    let detachTheme: (() => void) | null = null;

    import('lottie-web')
      .then(async L => {
        if (canceled) return;
        // Intersection gating
        const io = new IntersectionObserver((entries) => {
          (async () => {
            for (const entry of entries) {
              if (entry.isIntersecting) {
                visibleRef.current = true;
                if (!lottieRef.current) {
                  try {
                    const needsPre = (options.colorRemap || options.preloadFonts || options.useWorkerPreprocess);
                    const animationData = needsPre ? await fetchAndProcess() : undefined;
                    lottieRef.current = L.loadAnimation({
                      container: containerRef.current!,
                      path: animationData ? undefined : src,
                      animationData,
                      loop,
                      autoplay,
                      renderer: 'svg'
                    } as any);
                    lottieRef.current.setSpeed(speed);
                    animationRegistry.register(id, lottieRef.current);
                    // Event hooks
                    // Loop / segment loop handler
                    let loopHandler: (() => void) | null = null;
                    if (options.onLoopComplete || (options.segmentLoop && typeof options.segmentIndex === 'number')) {
                      loopHandler = () => {
                        if (options.onLoopComplete) options.onLoopComplete();
                        if (options.segmentLoop && typeof options.segmentIndex === 'number' && options.segments?.[options.segmentIndex]) {
                          const [s,e] = options.segments[options.segmentIndex];
                          try { lottieRef.current.playSegments([s,e], true); } catch { /* ignore */ }
                        }
                      };
                      lottieRef.current.addEventListener('loopComplete', loopHandler);
                    }
                    if (options.onComplete) {
                      lottieRef.current.addEventListener('complete', options.onComplete);
                    }
                    if (options.onSegmentStart) {
                      lottieRef.current.addEventListener('segmentStart', () => {
                        if (typeof options.segmentIndex === 'number') options.onSegmentStart?.(options.segmentIndex);
                      });
                    }
                    onLoad?.();
                    // Segments
                    if (options.segments?.length) {
                      options.segments.forEach(seg => {
                        try { lottieRef.current.addSegment(seg[0], seg[1], false); } catch { /* ignore */ }
                      });
                      if (typeof options.segmentIndex === 'number' && options.segments[options.segmentIndex]) {
                        const [s,e] = options.segments[options.segmentIndex];
                        try { lottieRef.current.playSegments([s,e], true); } catch { /* ignore */ }
                      }
                    }
                    detachTheme = onThemeChange(theme => {
                      const svg = containerRef.current?.querySelector('svg');
                      if (svg) svg.setAttribute('data-theme', theme);
                    });
                    const initialTheme = getCurrentTheme();
                    const svg = containerRef.current?.querySelector('svg');
                    if (svg) svg.setAttribute('data-theme', initialTheme);
                    if (respectPerfBudget) {
                      createPerfMonitor(() => {
                        if (lottieRef.current) lottieRef.current.pause();
                      });
                    }
                    if (options.adaptivePerformance && animationData) {
                      try {
                        const layerCount = Array.isArray(animationData.layers) ? animationData.layers.length : 0;
                        if (layerCount > 60) {
                          lottieRef.current.setSpeed(0.8);
                        }
                      } catch { /* ignore */ }
                    }
                  } catch (err) {
                    if (options.telemetry && (import.meta as any).env?.VITE_SENTRY_DSN) {
                      import('@sentry/react').then(S => { S.captureException(err); }).catch(()=>{});
                    }
                    onError?.(err);
                  }
                } else {
                  lottieRef.current.play();
                }
              } else {
                visibleRef.current = false;
                lottieRef.current?.pause();
              }
            }
          })();
        }, { rootMargin: intersectionRootMargin });
        io.observe(containerRef.current!);
        unobserve = () => io.disconnect();
        setReady(true);
      })
      .catch(err => onError?.(err));

    return () => {
      canceled = true;
      unobserve?.();
      detachTheme?.();
      if (lottieRef.current) {
        animationRegistry.unregister(id);
        try {
          // We can't easily remove the internal loopHandler reference (not retained outside closure) when segmentLoop is used without onLoopComplete.
          // If only segmentLoop was used, the animation instance will be destroyed which removes listeners. If onLoopComplete was provided, remove it.
          if (options.onLoopComplete) lottieRef.current.removeEventListener('loopComplete', options.onLoopComplete);
          if (options.onComplete) lottieRef.current.removeEventListener('complete', options.onComplete);
        } catch { /* noop */ }
        lottieRef.current.destroy();
      }
    };
  }, [id, src, loop, autoplay, reduceMotionAware, reducedMotion, speed, intersectionRootMargin, respectPerfBudget, onLoad, onError]);

  // If user toggles prefers-reduced-motion after mount → destroy
  useEffect(() => {
    if (reduceMotionAware && reducedMotion && lottieRef.current) {
      lottieRef.current.destroy();
      animationRegistry.unregister(id);
      lottieRef.current = null;
    }
  }, [reducedMotion, reduceMotionAware, id]);

  const controls = {
    play: () => lottieRef.current?.play(),
    pause: () => lottieRef.current?.pause(),
    setSpeed: (s: number) => lottieRef.current?.setSpeed(s),
    playSegment: (segment: [number,number], force = true) => {
      try { lottieRef.current?.playSegments(segment, force); } catch { /* noop */ }
    },
    isReady: () => ready && !!lottieRef.current,
    destroy: () => { try { lottieRef.current?.destroy(); } catch {} }
  };

  // Return ref object but attach controls for backward compatibility
  (containerRef as any).controls = controls;
  return containerRef as typeof containerRef & { controls: typeof controls };
}
