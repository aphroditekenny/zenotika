import { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react';
import { track } from '@/utils/analytics';
import { useServiceWorkerStatus } from '@/hooks/useServiceWorkerStatus';
import { isFeatureEnabled } from '@/featureFlags';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { useTheme } from './ThemeContext';
import { checkForUpdates } from '@/utils/swUpdates';
import type { SectionDescriptor } from '@/hooks/useSectionTracker';
import ActiveSectionLink from './ActiveSectionLink';
import { loadLogBookSectionModule, loadFooterSectionModule } from './HomePage';
import usePrefetchOnIntent from '@/hooks/usePrefetchOnIntent';

interface HeaderProps {
  onBackToLanding?: () => void;
  breadcrumb?: {
    sections: SectionDescriptor[];
    activeSection: SectionDescriptor | null;
    activeIndex: number;
    visitedIds: string[];
    visitedSections: SectionDescriptor[];
  };
}

type CrumbSegment = {
  id: string;
  label: string;
  title: string;
  onClick?: () => void;
  isActive?: boolean;
  isVisited?: boolean;
  interactive?: boolean;
  kind?: 'progress' | 'default';
};

type MenuLink = {
  label: string;
  target: string;
  description: string;
  annotation?: string;
  external?: boolean;
};

const PRIMARY_MENU_LINKS: MenuLink[] = [
  { label: 'Home', target: '#top', description: '> step 0, where it all began' },
  { label: 'About us', target: '#philosophy', description: '> learn who the hay we are' },
  { label: 'Log book', target: '#log-book', description: '> news and updates about all things Things' },
  { label: 'Contact', target: '#newsletter', description: '> say hi! we read every email' },
];

const PRODUCT_MENU_LINKS: MenuLink[] = [
  { label: 'Hunt', target: '#collection', description: '> collect the scattered relics' },
  { label: 'Projects', target: '#projects', description: '> see the interactive rooms and tools' },
];

const MENU_LINK_GROUPS = [
  { heading: 'Navigate', links: PRIMARY_MENU_LINKS },
  { heading: 'Our Things', links: PRODUCT_MENU_LINKS },
];

function Header({ onBackToLanding, breadcrumb }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { toggleTheme, isDark } = useTheme();
  const showPwa = isFeatureEnabled('pwa');
  const { canInstall, promptInstall, isStandalone, installed } = useInstallPrompt();
  const canCheckUpdates = typeof navigator !== 'undefined' && 'serviceWorker' in navigator;
  const menuTriggerRef = useRef<HTMLButtonElement | null>(null);
  const menuPanelRef = useRef<HTMLDivElement | null>(null);
  const sw = useServiceWorkerStatus();

  // Enhanced scroll handling with hide/show on scroll direction
  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;

    // Throttle state updates to prevent excessive re-renders
    if (Math.abs(currentScrollY - lastScrollY) < 5) return;

    setIsScrolled(currentScrollY > 20);

    // Hide header when scrolling down, show when scrolling up
    if (currentScrollY > lastScrollY && currentScrollY > 100) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }

    setLastScrollY(currentScrollY);
  }, [lastScrollY]);

  useEffect(() => {
    let ticking = false;
    let isActive = true;

    const throttledHandleScroll = () => {
      if (!ticking && isActive) {
        requestAnimationFrame(() => {
          if (isActive) {
            handleScroll();
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    return () => {
      isActive = false;
      window.removeEventListener('scroll', throttledHandleScroll);
    };
  }, [handleScroll]);

  // Close menu when clicking outside or pressing escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
        track('menu_close');
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (isMenuOpen && !(e.target as Element).closest('.zen-header, .zen-menu-panel')) {
        setIsMenuOpen(false);
        track('menu_close');
      }
    };

    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isMenuOpen]);



  const smoothScrollTo = (elementId: string) => {
    const rawId = elementId.startsWith('#') ? elementId.slice(1) : elementId;
    const element = document.getElementById(rawId);
    if (element) {
      const headerHeight = 80;
      const targetPosition = Math.max(0, element.offsetTop - headerHeight);
      const prefersReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({
        top: targetPosition,
        behavior: prefersReduced ? 'auto' : 'smooth'
      });
    }
    setIsMenuOpen(false);
  };

  const breadcrumbState = breadcrumb ?? {
    sections: [],
    activeSection: null,
    activeIndex: -1,
    visitedIds: [],
    visitedSections: [],
  };

  const crumbSegments: CrumbSegment[] = useMemo(() => {
    const segments: CrumbSegment[] = [
      {
        id: 'home',
        label: '/home',
        title: 'Scroll to top',
        onClick: () => smoothScrollTo('#top'),
        isActive: (breadcrumbState.activeIndex ?? 0) <= 0,
        isVisited: true,
        interactive: true,
      },
    ];

    if (breadcrumbState.sections.length === 0) return segments;

    const visited = breadcrumbState.visitedSections;
    const previous = visited.length > 1 ? visited[visited.length - 2] : null;
    const current =
      breadcrumbState.activeSection ??
      (visited.length > 0 ? visited[visited.length - 1] : null) ??
      breadcrumbState.sections[Math.max(0, Math.min(breadcrumbState.activeIndex, breadcrumbState.sections.length - 1))];

    if (previous && previous.id !== 'home') {
      segments.push({
        id: `prev-${previous.id}`,
        label: previous.crumb ?? `/${previous.label.toLowerCase().replace(/\s+/g, '-')}`,
        title: `Return to ${previous.label}`,
        onClick: () => smoothScrollTo(`#${previous.id}`),
        isVisited: true,
        interactive: true,
      });
    }

    if (current) {
      const normalizedLabel = current.crumb ?? `/${current.label.toLowerCase().replace(/\s+/g, '-')}`;
      const currentVisited = breadcrumbState.visitedIds.includes(current.id);
      segments.push({
        id: current.id,
        label: normalizedLabel,
        title: current.label,
        onClick: () => smoothScrollTo(`#${current.id}`),
        isActive: true,
        isVisited: currentVisited,
        interactive: true,
      });

      const inferredIndex =
        breadcrumbState.activeIndex >= 0
          ? breadcrumbState.activeIndex
          : breadcrumbState.sections.findIndex((section) => section.id === current.id);
      const total = breadcrumbState.sections.length;
      if (inferredIndex >= 0 && total > 0) {
        segments.push({
          id: `${current.id}-step`,
          label: `/${String(inferredIndex + 1).padStart(3, '0')}`,
          title: `Section ${inferredIndex + 1} of ${total}`,
          isActive: true,
          isVisited: currentVisited,
          interactive: false,
          kind: 'progress',
        });
      }
    }

    return segments;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [breadcrumbState.activeIndex, breadcrumbState.activeSection, breadcrumbState.sections, breadcrumbState.visitedIds, breadcrumbState.visitedSections]);

  const hasBreadcrumb = crumbSegments.length > 0;
  const visitedCount = breadcrumbState.visitedIds.length;
  const totalSections = breadcrumbState.sections.length;
  const progressPercent = totalSections > 0 ? Math.min(100, Math.round((visitedCount / totalSections) * 100)) : 0;
  const mobileBreadcrumbText = breadcrumbState.activeSection
    ? `${breadcrumbState.activeSection.label} · ${visitedCount}/${totalSections}`
    : 'Home';

  const headerClassName = [
    'zen-header',
    isDark ? 'zen-header--dark' : 'zen-header--light',
    isScrolled ? 'zen-header--scrolled' : 'zen-header--top',
    isVisible ? 'zen-header--visible' : 'zen-header--hidden',
    isMenuOpen ? 'zen-header--menu-open' : '',
  ].filter(Boolean).join(' ');

  const menuHighlights = useMemo(() => {
    const total = totalSections;
    const visited = visitedCount;
    const completion = total > 0 ? Math.round((visited / total) * 100) : 0;

    const activeLabel = breadcrumbState.activeSection?.label ?? 'Starter log';
    const nextSection = breadcrumbState.sections.find((section) => !breadcrumbState.visitedIds.includes(section.id));
    const nextLabel = nextSection?.label ?? 'Explore the archive';

    return {
      completion,
      activeLabel,
      nextLabel,
    };
  }, [breadcrumbState.activeSection?.label, breadcrumbState.sections, breadcrumbState.visitedIds, totalSections, visitedCount]);

  // Focus trap & restoration for menu
  useEffect(() => {
    const body = document.body;
    if (isMenuOpen) {
      body.setAttribute('data-menu-open', 'true');
      track('menu_open');
    } else {
      body.removeAttribute('data-menu-open');
    }
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const panel = menuPanelRef.current;
    if (!panel) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusable = Array.from(panel.querySelectorAll<HTMLElement>(focusableSelectors)).filter(el => !el.hasAttribute('disabled'));
    if (focusable.length) focusable[0].focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || focusable.length < 2) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
      menuTriggerRef.current?.focus();
      previouslyFocused?.focus?.();
    };
  }, [isMenuOpen]);

  const toggleMenu = () => setIsMenuOpen(o => !o);

  return (
    <header className={headerClassName}>
      <div className="zen-header__atmosphere" aria-hidden="true">
        <div className="zen-header__atmosphere-layers" aria-hidden="true">
          <div className="zen-header__gradient-layer" />
          <div className="zen-header__stars-layer" />
          <div className="zen-header__glow" />
        </div>
      </div>
      <div className="padding-global zen-header__padding">
        <div className="container-xlarge">
          <nav className="zen-header__nav" aria-label="Primary navigation">
            <div className="zen-header__left">
              <button
                type="button"
                ref={menuTriggerRef}
                aria-expanded={isMenuOpen}
                aria-controls="zen-primary-menu zen-menu-panel"
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                className="zen-menu-trigger"
                onClick={toggleMenu}
              >
                <span className="zen-menu-trigger__bars" aria-hidden="true">
                  <span data-index="0" />
                  <span data-index="1" />
                  <span data-index="2" />
                </span>
                <span className="zen-menu-trigger__label" aria-hidden="true">
                  <span className="zen-menu-trigger__track">
                    <span>Menu</span>
                    <span>Close</span>
                  </span>
                </span>
              </button>

              <button
                type="button"
                className="zen-logo-button"
                aria-label="Back to landing"
                onClick={() => {
                  onBackToLanding?.();
                  track('navigate_landing');
                }}
              >
                <img
                  src="https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/66ea3a5528a044beafcf917f_Logo_Icon.svg"
                  alt="Things Inc logo"
                  loading="eager"
                />
              </button>

              {/* Inline primary nav quick links (desktop) */}
              {breadcrumb && breadcrumb.sections?.length ? (
                <div className="hidden md:flex items-center gap-2 pl-2" aria-label="Quick section links">
                  {PRIMARY_MENU_LINKS.map(link => {
                    const ref = useRef<HTMLAnchorElement | null>(null);
                    // Intent prefetch only for heavier sections (Log book & Contact -> Footer)
                    if (link.label === 'Log book') {
                      usePrefetchOnIntent({ ref, prefetch: () => loadLogBookSectionModule() });
                    } else if (link.label === 'Contact') {
                      usePrefetchOnIntent({ ref, prefetch: () => loadFooterSectionModule() });
                    }
                    return (
                      <ActiveSectionLink
                        key={link.target}
                        ref={ref}
                        href={link.target}
                        label={link.label}
                        active={typeof window !== 'undefined' && window.location.hash === link.target}
                        onClick={() => track('navigate_' + link.label.toLowerCase().replace(/\s+/g,'_'))}
                      />
                    );
                  })}
                </div>
              ) : null}
            </div>

            <div className="zen-header__right">
              <div className="zen-theme-toggle" role="presentation">
                <span aria-hidden="true">Night</span>
                <button
                  type="button"
                  className="zen-theme-toggle__control"
                  onClick={() => { toggleTheme(); track('theme_toggle', { to: isDark ? 'day' : 'night' }); }}
                  aria-label={`Switch to ${isDark ? 'day' : 'night'} theme`}
                  aria-pressed={isDark}
                >
                  <span className="zen-theme-toggle__background" aria-hidden="true" />
                  <span className="zen-theme-toggle__thumb" data-theme={isDark ? 'night' : 'day'}>
                    <svg viewBox="0 0 20 20" aria-hidden="true">
                      {isDark ? (
                        <path d="M17.293 13.293A8 8 0 016.707 2.707 8.001 8.001 0 1017.293 13.293Z" />
                      ) : (
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                        />
                      )}
                    </svg>
                  </span>
                  {/* Scene layers for enhanced theme toggle visuals */}
                  <span className="zen-theme-toggle__scene" aria-hidden="true">
                    <span className="zen-theme-toggle__scene-day" />
                    <span className="zen-theme-toggle__scene-night" />
                  </span>
                </button>
                <span aria-hidden="true">Day</span>
              </div>

              <div className="zen-header__meta">
                <button type="button" className="zen-collection-button" aria-label="Visited sections progress">
                  <span className="zen-collection-button__icon" aria-hidden="true">
                    <svg viewBox="0 0 32 32" fill="none">
                      <path
                        d="M24.0001 4C24.7365 4 25.3334 4.59695 25.3334 5.33333C25.3334 5.68695 25.4739 6.02609 25.7239 6.27614C25.974 6.52619 26.3131 6.66667 26.6667 6.66667C27.4031 6.66667 28.0001 7.26362 28.0001 8C28.0001 8.73638 27.4031 9.33333 26.6667 9.33333C26.3131 9.33333 25.974 9.47381 25.7239 9.72386C25.4739 9.97391 25.3334 10.313 25.3334 10.6667C25.3334 11.403 24.7365 12 24.0001 12C23.2637 12 22.6667 11.403 22.6667 10.6667C22.6667 10.313 22.5263 9.97391 22.2762 9.72386C22.0262 9.47381 21.687 9.33333 21.3334 9.33333C20.597 9.33333 20.0001 8.73638 20.0001 8C20.0001 7.26362 20.597 6.66667 21.3334 6.66667C21.687 6.66667 22.0262 6.52619 22.2762 6.27614C22.5263 6.02609 22.6667 5.68695 22.6667 5.33333C22.6667 4.59695 23.2637 4 24.0001 4ZM12.0001 6.66667C12.7365 6.66667 13.3334 7.26362 13.3334 8C13.3334 9.76811 14.0358 11.4638 15.286 12.714C16.5363 13.9643 18.232 14.6667 20.0001 14.6667C20.7365 14.6667 21.3334 15.2636 21.3334 16C21.3334 16.7364 20.7365 17.3333 20.0001 17.3333C18.232 17.3333 16.5363 18.0357 15.286 19.286C14.0358 20.5362 13.3334 22.2319 13.3334 24C13.3334 24.7364 12.7365 25.3333 12.0001 25.3333C11.2637 25.3333 10.6667 24.7364 10.6667 24C10.6667 22.2319 9.96437 20.5362 8.71413 19.286C7.46388 18.0357 5.76819 17.3333 4.00008 17.3333C3.2637 17.3333 2.66675 16.7364 2.66675 16C2.66675 15.2636 3.2637 14.6667 4.00008 14.6667C5.76819 14.6667 7.46388 13.9643 8.71413 12.714C9.96437 11.4638 10.6667 9.76811 10.6667 8C10.6667 7.26362 11.2637 6.66667 12.0001 6.66667ZM12.0001 12.8075C11.6113 13.4544 11.1424 14.057 10.5997 14.5997C10.0571 15.1423 9.4545 15.6112 8.80754 16C9.4545 16.3888 10.0571 16.8577 10.5997 17.4003C11.1424 17.943 11.6113 18.5456 12.0001 19.1925C12.3888 18.5456 12.8578 17.943 13.4004 17.4003C13.9431 16.8577 14.5457 16.3888 15.1926 16C14.5457 15.6112 13.9431 15.1423 13.4004 14.5997C12.8578 14.057 12.3888 13.4544 12.0001 12.8075ZM22.6667 21.3333C22.6667 20.597 23.2637 20 24.0001 20C24.7365 20 25.3334 20.597 25.3334 21.3333C25.3334 21.687 25.4739 22.0261 25.7239 22.2761C25.974 22.5262 26.3131 22.6667 26.6667 22.6667C27.4031 22.6667 28.0001 23.2636 28.0001 24C28.0001 24.7364 27.4031 25.3333 26.6667 25.3333C26.3131 25.3333 25.974 25.4738 25.7239 25.7239C25.4739 25.9739 25.3334 26.313 25.3334 26.6667C25.3334 27.403 24.7365 28 24.0001 28C23.2637 28 22.6667 27.403 22.6667 26.6667C22.6667 26.313 22.5263 25.9739 22.2762 25.7239C22.0262 25.4738 21.687 25.3333 21.3334 25.3333C20.597 25.3333 20.0001 24.7364 20.0001 24C20.0001 23.2636 20.597 22.6667 21.3334 22.6667C21.687 22.6667 22.0262 22.5262 22.2762 22.2761C22.5263 22.0261 22.6667 21.687 22.6667 21.3333Z"
                        fill="currentColor"
                        fillRule="evenodd"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                  <span className="zen-collection-button__count">
                    <span className="zen-count__value">{String(visitedCount).padStart(2, '0')}</span>
                    <span className="zen-count__divider">/</span>
                    <span className="zen-count__total">{String(totalSections).padStart(2, '0')}</span>
                  </span>
                  <span className="zen-collection-button__caret" aria-hidden="true">
                    <svg viewBox="0 0 8 5" fill="none">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M0.292893 0.292893C0.683417 -0.0976311 1.31658 -0.0976311 1.70711 0.292893L4 2.58579L6.29289 0.292893C6.68342 -0.0976311 7.31658 -0.0976311 7.70711 0.292893C8.09763 0.683417 8.09763 1.31658 7.70711 1.70711L4.70711 4.70711C4.31658 5.09763 3.68342 5.09763 3.29289 4.70711L0.292893 1.70711C-0.0976311 1.31658 -0.0976311 0.683417 0.292893 0.292893Z"
                        fill="currentColor"
                      />
                    </svg>
                  </span>
                  <span className="zen-collection-button__bar" aria-hidden="true">
                    <span style={{ width: `${progressPercent}%` }} />
                  </span>
                </button>

                <div className="zen-header__chips" role="group" aria-label="App options">
                  {showPwa && canCheckUpdates && (
                    <button
                      type="button"
                      className="zen-chip"
                      onClick={() => { void checkForUpdates(); }}
                    >
                      Check updates
                    </button>
                  )}
                  {showPwa && canInstall && !isStandalone && !installed && (
                    <button
                      type="button"
                      className="zen-chip"
                      onClick={() => { void promptInstall(); }}
                    >
                      Install app
                    </button>
                  )}
                  {showPwa && (installed || isStandalone) && (
                    <span className="zen-chip zen-chip--muted" aria-label="App installed">
                      Installed
                    </span>
                  )}
                </div>
              </div>
            </div>
          </nav>

          {hasBreadcrumb && (
            <div className="zen-header__mobile-breadcrumb" aria-hidden="true">
              {mobileBreadcrumbText}
            </div>
          )}

          <div className="zen-header__status" role="status" aria-live="polite">
            {breadcrumbState.activeSection
              ? `Active section ${breadcrumbState.activeSection.label}. ${breadcrumbState.visitedSections.length} of ${breadcrumbState.sections.length} sections visited.`
              : 'Viewing home section'}
          </div>
        </div>
      </div>

      <div
        className={`zen-header__overlay ${isMenuOpen ? 'is-visible' : ''}`}
        role="presentation"
        onClick={() => setIsMenuOpen(false)}
        aria-hidden={!isMenuOpen}
      />

      <div
        id="zen-menu-panel"
        role="dialog"
        aria-modal="true"
        aria-hidden={!isMenuOpen}
        aria-label="Site navigation"
        className={`zen-menu-panel ${isMenuOpen ? 'is-visible' : ''}`}
        ref={menuPanelRef}
      >
        <div className="zen-menu-panel__inner">
          <div className="zen-menu-panel__header">
            <div className="zen-menu-panel__title">Things navigator</div>
            <button type="button" className="zen-menu-panel__close" onClick={() => setIsMenuOpen(false)}>
              Close
            </button>
          </div>
          <div className="zen-menu-panel__grid">
            <div className="zen-menu-panel__column">
              {MENU_LINK_GROUPS.map((group) => (
                <div key={group.heading} className="zen-menu-panel__group">
                  <p className="zen-menu-panel__eyebrow">{group.heading}</p>
                  <ul role="list" className="zen-menu-panel__list">
                    {group.links.map((link) => (
                      <li key={link.label}>
                        <button
                          type="button"
                          className="zen-menu-panel__link"
                          onClick={() => smoothScrollTo(link.target)}
                        >
                          <span className="zen-menu-panel__link-label">{link.label}</span>
                          <span className="zen-menu-panel__link-description">{link.description}</span>
                          <span className="zen-menu-panel__link-arrow" aria-hidden="true">
                            <svg viewBox="0 0 17 12" fill="none">
                              <path
                                d="M13.2404 4.92144L10.1346 1.84756C9.91667 1.63185 9.81223 1.38019 9.82132 1.09257C9.8304 0.804959 9.93483 0.553297 10.1346 0.337586C10.3526 0.121875 10.6114 0.00952527 10.9111 0.00053734C11.2107 -0.00845059 11.4696 0.0949107 11.6875 0.310622L16.6731 5.24501C16.891 5.46072 17 5.71238 17 6C17 6.28761 16.891 6.53928 16.6731 6.75499L11.6875 11.6894C11.4696 11.9051 11.2107 12.0084 10.9111 11.9995C10.6114 11.9905 10.3526 11.8781 10.1346 11.6624C9.93483 11.4467 9.8304 11.195 9.82131 10.9074C9.81223 10.6198 9.91667 10.3681 10.1346 10.1524L13.2404 7.07855L1.08975 7.07855C0.780985 7.07855 0.522171 6.97519 0.313303 6.76847C0.104436 6.56174 0 6.30559 0 6C0 5.69441 0.104436 5.43825 0.313304 5.23153C0.522171 5.0248 0.780985 4.92144 1.08975 4.92144L13.2404 4.92144Z"
                                fill="currentColor"
                              />
                            </svg>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="zen-menu-panel__column zen-menu-panel__column--accent">
              <div className="zen-menu-panel__card">
                <p className="zen-menu-panel__card-eyebrow">Current mission</p>
                <h4 className="zen-menu-panel__card-title">{menuHighlights.activeLabel}</h4>
                <p className="zen-menu-panel__card-description">
                  {menuHighlights.completion >= 100
                    ? 'You have explored the full scavenger hunt. Peek the archive for hidden rewards.'
                    : `Next up: ${menuHighlights.nextLabel}. Keep collecting the sparks and we’ll reveal an extra.`}
                </p>
                <div className="zen-menu-panel__progress" role="img" aria-label={`Progress ${menuHighlights.completion}%`}>
                  <div className="zen-menu-panel__progress-bar">
                    <span style={{ width: `${menuHighlights.completion}%` }} />
                  </div>
                  <span className="zen-menu-panel__progress-value">{menuHighlights.completion}% complete</span>
                </div>
                <button type="button" className="zen-menu-panel__cta" onClick={() => { smoothScrollTo('#collection'); track('resume_hunt'); }}>
                  Resume hunt
                </button>
              </div>
              <div className="zen-menu-panel__note">
                <p className="zen-menu-panel__note-eyebrow">Quick actions</p>
                <div className="zen-menu-panel__note-actions">
                  <button type="button" className="zen-chip" onClick={() => { toggleTheme(); track('theme_toggle', { fromMenu: true, to: isDark ? 'day' : 'night' }); }}>
                    Switch to {isDark ? 'day' : 'night'}
                  </button>
                  {showPwa && canInstall && !isStandalone && !installed ? (
                    <button type="button" className="zen-chip" onClick={() => { void promptInstall(); }}>
                      Install app
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <aside
        id="zen-primary-menu"
        className={`zen-mobile-menu ${isMenuOpen ? 'is-visible' : ''}`}
        aria-hidden={!isMenuOpen}
      >
        <div className="zen-mobile-menu__inner">
          <div className="zen-mobile-menu__header">
            <span className="zen-mobile-menu__eyebrow">Navigation</span>
            <button type="button" onClick={() => { setIsMenuOpen(false); track('menu_close'); }} className="zen-mobile-menu__close">
              Close
            </button>
          </div>
          <div className="zen-mobile-menu__stack">
            {MENU_LINK_GROUPS.map((group) => (
              <div key={group.heading} className="zen-mobile-menu__group">
                <p className="zen-mobile-menu__eyebrow">{group.heading}</p>
                <ul className="zen-mobile-menu__links" role="list">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <button
                        type="button"
                        onClick={() => smoothScrollTo(link.target)}
                        className="zen-mobile-menu__link"
                      >
                        <span>{link.label}</span>
                        <span className="zen-mobile-menu__description">{link.description}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="zen-mobile-menu__footer">
            <div className="zen-mobile-menu__theme">
              <span>Theme</span>
              <button
                type="button"
                onClick={() => { toggleTheme(); track('theme_toggle', { fromMobile: true, to: isDark ? 'day' : 'night' }); }}
                className="zen-chip"
              >
                Switch to {isDark ? 'day' : 'night'}
              </button>
            </div>
            {showPwa && (
              <div className="zen-mobile-menu__actions">
                {canInstall && !isStandalone && !installed && (
                  <button type="button" className="zen-chip" onClick={() => { void promptInstall(); track('pwa_update_trigger'); }}>
                    Install app
                  </button>
                )}
                {(installed || isStandalone) && (
                  <span className="zen-chip zen-chip--muted" aria-label="App installed">
                    Installed
                  </span>
                )}
                {sw.offline && (
                  <span className="zen-chip zen-chip--muted" aria-label="Offline mode active">Offline</span>
                )}
                {sw.waiting && (
                  <button type="button" className="zen-chip" onClick={() => { sw.update(); track('pwa_refresh'); }}>
                    Update ready
                  </button>
                )}
                {canCheckUpdates && (
                  <button type="button" className="zen-chip" onClick={() => { void checkForUpdates(); }}>
                    Check updates
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </aside>
    </header>
  );
}

export default memo(Header);