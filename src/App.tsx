import {
  useState,
  startTransition,
  useCallback,
  memo,
  useEffect,
  Suspense,
  lazy,
  type ComponentType,
} from "react";
import "./styles/globals.css";
import { ThemeProvider } from "./components/ThemeContext";
import { defaultMeta, buildMeta } from "./content/meta";
import { metaID } from "./content/meta.id";
import { performanceCollector } from "./utils/performanceCollector";
import { isFeatureEnabled } from "./featureFlags";
import HeroSection from "./components/HeroSection";
import PageTransition from "./components/PageTransition";
import AccessibilityProvider from "./components/AccessibilityProvider";
// (existing import moved above to avoid duplicate) 
import { triggerUpdateToast } from "./pwaDebug";
import { loadSonner } from "./utils/loadSonner";

type HomePageProps = { onBackToLanding: () => void };
type HomePageModule = typeof import("./components/HomePage");

const lazyHomeEnabled = isFeatureEnabled("lazyHomePage");
const pwaEnabled = isFeatureEnabled("pwa");

let homePageModulePromise: Promise<HomePageModule> | null = null;

function ensureHomePageModule() {
  if (!homePageModulePromise) {
    homePageModulePromise = import("./components/HomePage");
  }
  return homePageModulePromise;
}

const LazyToaster = lazy(async () => {
  const mod = await import("sonner");
  return { default: mod.Toaster };
});

const LazyPWAInstallFab = lazy(async () => {
  const mod = await import("./components/PWAInstallFab");
  return { default: mod.PWAInstallFab };
});

export function preloadHomePage() {
  return ensureHomePageModule();
}

let HomePageComponent: ComponentType<HomePageProps>;

if (lazyHomeEnabled) {
  HomePageComponent = lazy(async () => ensureHomePageModule());
} else {
  const module = await ensureHomePageModule();
  HomePageComponent = module.default;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'home'>('landing');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [nextPage, setNextPage] = useState<'landing' | 'home' | null>(null);

  const navigateToHome = useCallback(() => {
    if (isTransitioning) return;

    setIsTransitioning(true);
    setNextPage('home');

    if (lazyHomeEnabled) {
      void preloadHomePage();
    }

    // Smooth transition with proper timing
    setTimeout(() => {
      startTransition(() => {
        setCurrentPage('home');
        setNextPage(null);
        setIsTransitioning(false);
      });
    }, 600); // Match CSS transition duration
  }, [isTransitioning]);

  const navigateToLanding = useCallback(() => {
    if (isTransitioning) return;

    setIsTransitioning(true);
    setNextPage('landing');

    setTimeout(() => {
      startTransition(() => {
        setCurrentPage('landing');
        setNextPage(null);
        setIsTransitioning(false);
      });
    }, 600);
  }, [isTransitioning]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const targetPage = event.state?.page || 'landing';
      if (targetPage !== currentPage) {
        if (targetPage === 'home') {
          navigateToHome();
        } else {
          navigateToLanding();
        }
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Set initial history state
    window.history.replaceState({ page: currentPage }, '', window.location.pathname);

    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentPage, navigateToHome, navigateToLanding]);

  // Update browser history on page change
  useEffect(() => {
    if (!isTransitioning) {
      const url = currentPage === 'home' ? '/#home' : '/';
      window.history.pushState({ page: currentPage }, '', url);
    }
  }, [currentPage, isTransitioning]);

  useEffect(() => {
    if (!pwaEnabled) return;
  let cancelled = false;
  let observer: MutationObserver | null = null;
  let fallbackTimeout: number | null = null;
  const win = window as typeof window & { __PWA_DEBUG_READY?: boolean };
    const handler: EventListener = (event) => {
      const customEvent = event as CustomEvent<ServiceWorker | undefined>;
      triggerUpdateToast(customEvent?.detail);
    };
    const markReady = () => {
      if (cancelled) return;
      if (win.__PWA_DEBUG_READY === true) return;
      win.__PWA_DEBUG_READY = true;
      if (fallbackTimeout !== null) {
        window.clearTimeout(fallbackTimeout);
        fallbackTimeout = null;
      }
    };
    const ensureToasterPresent = () => {
      const toaster = document.querySelector('[data-sonner-toaster]');
      if (toaster) {
        markReady();
        observer?.disconnect();
        observer = null;
        return true;
      }
      return false;
    };

    win.__PWA_DEBUG_READY = false;
    void loadSonner()
      .catch(() => {})
      .finally(() => {
        if (cancelled) return;
        if (ensureToasterPresent()) {
          return;
        }
        observer = new MutationObserver(() => {
          if (ensureToasterPresent()) {
            observer?.disconnect();
            observer = null;
          }
        });
        const target = document.body ?? document.documentElement;
        if (!target) {
          markReady();
          return;
        }
        observer.observe(target, { childList: true, subtree: true });
        fallbackTimeout = window.setTimeout(() => {
          markReady();
          observer?.disconnect();
          observer = null;
        }, 3000);
      });
  window.addEventListener('pwa:debug-update-toast', handler);
    return () => {
      cancelled = true;
      observer?.disconnect();
      if (fallbackTimeout !== null) {
        window.clearTimeout(fallbackTimeout);
      }
  window.removeEventListener('pwa:debug-update-toast', handler);
      delete win.__PWA_DEBUG_READY;
    };
  }, []);

  return (
    <ThemeProvider>
      <AccessibilityProvider>
        <MetaManager />
        <LanguageSwitcher />
        {/* Skip to content link for keyboard users */}
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-white focus:text-black focus:px-4 focus:py-2 focus:rounded-md">Skip to content</a>
        <PageTransition
          isTransitioning={isTransitioning}
          direction={nextPage === 'home' ? 'forward' : 'backward'}
        >
          {currentPage === 'landing' ? (
            <LandingPage onNavigateToHome={navigateToHome} />
          ) : (
            <Suspense fallback={<HomePageFallback />}>
              <HomePageComponent onBackToLanding={navigateToLanding} />
            </Suspense>
          )}
        </PageTransition>
        {pwaEnabled ? (
          <Suspense fallback={null}>
            <LazyPWAInstallFab />
          </Suspense>
        ) : null}
        {pwaEnabled ? (
          <Suspense fallback={null}>
            <LazyToaster position="top-center" richColors closeButton />
          </Suspense>
        ) : null}
        {isFeatureEnabled('performanceMetrics') ? <WebVitalsBadge /> : null}
      </AccessibilityProvider>
    </ThemeProvider>
  );
}

// Landing Page Component - Optimized for performance
const LandingPage = memo(function LandingPage({ onNavigateToHome }: { onNavigateToHome: () => void }) {
  return (
    <div className="landing-page-wrapper">
      <main className="main-wrapper" id="main-content" role="main">
        <HeroSection onNavigateToHome={onNavigateToHome} />
        <div className="custom-background page-top" aria-hidden="true"></div>
      </main>
    </div>
  );
});

const HomePageFallback = memo(function HomePageFallback() {
  return (
    <div className="home-page-wrapper" role="status" aria-live="polite">
      <div className="custom-background page-top" aria-hidden="true"></div>
      <div className="main-wrapper flex items-center justify-center min-h-screen">
        <p className="text-white/80 text-lg tracking-wide">Loading the experience…</p>
      </div>
    </div>
  );
});

// Runtime meta manager: keeps <head> tags in sync with meta module.
const MetaManager = memo(function MetaManager() {
  useEffect(() => {
    // Locale heuristic with override
    const stored = localStorage.getItem('zenotikaLocale');
    const auto = (navigator?.language || 'en').toLowerCase().startsWith('id') ? 'id' : 'en';
    const locale = (stored === 'en' || stored === 'id') ? stored : auto;
    const selected = locale === 'id' ? metaID : defaultMeta;
    const meta = buildMeta({
      title: selected.title,
      description: selected.description,
      keywords: selected.keywords,
      canonical: selected.canonical
    });
    (window as any).__ZENOTIKA_META = { meta, locale, at: Date.now() };
    document.title = meta.title;
    const ensure = (name: string, attr: 'name' | 'property' = 'name') => {
      let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      return el;
    };
    ensure('description').setAttribute('content', meta.description);
    ensure('keywords').setAttribute('content', meta.keywords.join(', '));
    ensure('og:title', 'property').setAttribute('content', meta.title);
    ensure('og:description', 'property').setAttribute('content', meta.description);
    ensure('og:url', 'property').setAttribute('content', meta.canonical);
    // OG images (PNG fallback + svg)
    ensure('og:image', 'property').setAttribute('content', meta.canonical + 'share.png');
    const secondOg = document.createElement('meta');
    secondOg.setAttribute('property','og:image');
    secondOg.setAttribute('content', meta.canonical + 'share.svg');
    document.head.appendChild(secondOg);
    ensure('twitter:title').setAttribute('content', meta.title);
    ensure('twitter:description').setAttribute('content', meta.description);
    ensure('twitter:image').setAttribute('content', meta.canonical + 'share.png');
    // hreflang alternates (id/en same canonical now)
    const existingHL = Array.from(document.head.querySelectorAll('link[rel="alternate"][hreflang]'));
    existingHL.forEach(l => l.remove());
    ['en','id'].forEach(lang => {
      const link = document.createElement('link');
      link.setAttribute('rel','alternate');
      link.setAttribute('hreflang', lang);
      link.setAttribute('href', meta.canonical);
      document.head.appendChild(link);
    });
  }, []);
  return null;
});

const LanguageSwitcher = memo(function LanguageSwitcher(){
  const [locale,setLocale] = useState<string>(()=> localStorage.getItem('zenotikaLocale') || 'auto');
  const apply = (val:string)=>{
    if(val==='auto'){ localStorage.removeItem('zenotikaLocale'); } else { localStorage.setItem('zenotikaLocale', val); }
    setLocale(val);
    // Re-run MetaManager logic by forcing a minimal tick
    setTimeout(()=>{
      const evt = new Event('zenotika:meta-refresh');
      window.dispatchEvent(evt);
      // naive: re-mount MetaManager by manipulating title (cheap) — or simply call location.reload() for simplicity
      location.reload();
    },10);
  };
  return (
    <div className="fixed top-3 left-3 z-[1200] text-xs font-medium text-white/80 backdrop-blur bg-black/30 border border-white/10 rounded-full px-3 py-1 flex gap-2 items-center">
      <span className="hidden sm:inline">Lang</span>
      {['auto','en','id'].map(code => (
        <button key={code} onClick={()=>apply(code)} className={`px-2 py-0.5 rounded-full border transition-colors ${locale===code ? 'bg-white/20 border-white/40 text-white' : 'border-transparent text-white/60 hover:text-white'}`}>{code}</button>
      ))}
    </div>
  );
});

// Lightweight Web Vitals Badge (client-only)
const WebVitalsBadge = memo(function WebVitalsBadge() {
  const [metrics, setMetrics] = useState<{ LCP?: number; INP?: number; CLS?: number }>(() => ({}));
  const [averages, setAverages] = useState<{ LCP?: number; INP?: number; CLS?: number }>(() => {
    try {
      const raw = sessionStorage.getItem('zenotikaVitals');
      if (raw) {
        const parsed = JSON.parse(raw) as { samples: Record<string, number[]> };
        const lcpArr = parsed.samples.LCP || [];
        const inpArr = parsed.samples.INP || [];
        const clsArr = parsed.samples.CLS || [];
        return {
          LCP: lcpArr.length ? Number((lcpArr.reduce((a,b)=>a+b,0)/lcpArr.length).toFixed(2)) : undefined,
          INP: inpArr.length ? Number((inpArr.reduce((a,b)=>a+b,0)/inpArr.length).toFixed(2)) : undefined,
          CLS: clsArr.length ? Number((clsArr.reduce((a,b)=>a+b,0)/clsArr.length).toFixed(3)) : undefined,
        };
      }
    } catch {}
    return {};
  });
  const [showTimeline, setShowTimeline] = useState(false);
  const [timeline, setTimeline] = useState<Array<{ name:string; value:number; ts:number }>>([]);

  // Accumulate samples for averages (session-scoped)
  useEffect(() => {
    const state = { samples: { LCP: [] as number[], INP: [] as number[], CLS: [] as number[] } } as { samples: Record<string, number[]> };
    try {
      const raw = sessionStorage.getItem('zenotikaVitals');
      if (raw) Object.assign(state, JSON.parse(raw));
    } catch {}
    const unsub = performanceCollector.subscribe((m) => {
      setMetrics(prev => {
        const next = { ...prev };
        if (m.name === 'LCP') next.LCP = Number(m.value.toFixed(2));
        if (m.name === 'INP') next.INP = Number(m.value.toFixed(2));
        if (m.name === 'CLS') next.CLS = Number(m.value.toFixed(3));
        return next;
      });
      if (m.name === 'LCP' || m.name === 'INP' || m.name === 'CLS') {
        const arr = state.samples[m.name] || (state.samples[m.name] = []);
        arr.push(m.value);
        // Keep only last 30 for memory safety
        if (arr.length > 30) arr.shift();
        try { sessionStorage.setItem('zenotikaVitals', JSON.stringify(state)); } catch {}
        const mean = arr.reduce((a,b)=>a+b,0)/arr.length;
        setAverages(a => ({ ...a, [m.name]: Number(mean.toFixed(m.name==='CLS'?3:2)) }));
      }
      setTimeline(list => {
        const next = [...list, { name: m.name, value: Number(m.value.toFixed(m.name==='CLS'?3:2)), ts: Date.now() }];
        if (next.length > 60) next.shift();
        return next;
      });
    });
    return unsub;
  }, []);

  // (subscription moved above to include averaging/persist logic)

  if (!metrics || (metrics.LCP === undefined && metrics.INP === undefined && metrics.CLS === undefined)) {
    return null; // avoid layout shift
  }

  const quality = (name: 'LCP' | 'INP' | 'CLS', value?: number) => {
    if (value === undefined) return '';
    switch (name) {
      case 'LCP': return value <= 2500 ? 'good' : value <= 4000 ? 'needs' : 'poor';
      case 'INP': return value <= 200 ? 'good' : value <= 500 ? 'needs' : 'poor';
      case 'CLS': return value <= 0.1 ? 'good' : value <= 0.25 ? 'needs' : 'poor';
    }
  };

  const badgeColor = (q?: string) => q === 'good' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : q === 'needs' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-rose-500/25 text-rose-300 border-rose-500/40';

  return (
    <div className="fixed bottom-3 right-3 z-[1100] select-none">
      <div className="pointer-events-auto backdrop-blur-md bg-black/30 border border-white/10 rounded-xl px-3 py-2 shadow-lg flex gap-2 text-[11px] font-mono tracking-tight text-white/80">
        {(['LCP','INP','CLS'] as const).map(key => {
          const val = metrics[key];
            if (val === undefined) return null;
            const q = quality(key, val);
            return (
              <span key={key} className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border ${badgeColor(q)}`} aria-label={`${key} ${val} ${q}`}> {key}: {val}{key==='LCP'|| key==='INP' ? 'ms' : ''}</span>
            );
        })}
        {(averages.LCP !== undefined || averages.INP !== undefined || averages.CLS !== undefined) && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md border bg-white/10 text-white/70 border-white/20" aria-label="Averages">
            avg:{averages.LCP !== undefined ? ` LCP ${averages.LCP}ms` : ''}{averages.INP !== undefined ? ` INP ${averages.INP}ms` : ''}{averages.CLS !== undefined ? ` CLS ${averages.CLS}` : ''}
          </span>
        )}
        <button onClick={()=>setShowTimeline(s=>!s)} className="ml-1 px-2 py-1 rounded-md border border-white/20 bg-white/5 text-white/70 hover:text-white hover:bg-white/10 transition-colors" aria-expanded={showTimeline} aria-controls="vitals-timeline">{showTimeline ? 'hide' : 'timeline'}</button>
      </div>
      {showTimeline && (
        <div id="vitals-timeline" role="region" aria-label="Web Vitals timeline" className="pointer-events-auto mt-2 max-h-60 w-[360px] overflow-auto rounded-lg border border-white/10 bg-black/70 backdrop-blur p-3 text-[11px] font-mono text-white/70 space-y-1">
          {timeline.slice().reverse().map(item => (
            <div key={item.ts+item.name} className="flex justify-between gap-2">
              <span className="text-white/60">{item.name}</span>
              <span className="text-white/90">{item.value}{item.name==='LCP'|| item.name==='INP' ? 'ms' : ''}</span>
              <span className="text-white/40 tabular-nums">{new Date(item.ts).toLocaleTimeString(undefined,{ hour12:false, minute:'2-digit', second:'2-digit'})}</span>
            </div>
          ))}
          {timeline.length===0 && <div className="text-white/40">No samples yet.</div>}
        </div>
      )}
    </div>
  );
});

export { WebVitalsBadge };