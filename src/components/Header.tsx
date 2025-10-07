import { useState, useEffect, useCallback, memo } from 'react';
import { isFeatureEnabled } from '@/featureFlags';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { useTheme } from './ThemeContext';
import { checkForUpdates } from '@/utils/swUpdates';
import type { SectionDescriptor } from '@/hooks/useSectionTracker';

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

const MENU_LINKS = [
  { label: 'Our Things', target: '#our-things', description: 'Explore the rooms and playful tools.' },
  { label: 'Log Book', target: '#log-book', description: 'Catch up on the latest dispatches.' },
  { label: 'Newsletter', target: '#newsletter', description: 'Hop on the list for new drops.' },
];

function Header({ onBackToLanding, breadcrumb }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { toggleTheme, isDark, isLight } = useTheme();
  const showPwa = isFeatureEnabled('pwa');
  const { canInstall, promptInstall, isStandalone, installed } = useInstallPrompt();
  const canCheckUpdates = typeof navigator !== 'undefined' && 'serviceWorker' in navigator;

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

  // Close mobile menu when clicking outside or pressing escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (isMobileMenuOpen && !(e.target as Element).closest('header')) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('click', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);



  const smoothScrollTo = (elementId: string) => {
    const element = document.getElementById(elementId.replace('#', ''));
    if (element) {
      const headerHeight = 80;
      const targetPosition = element.offsetTop - headerHeight;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
    setIsMobileMenuOpen(false);
  };

  const breadcrumbState = breadcrumb ?? {
    sections: [],
    activeSection: null,
    activeIndex: -1,
    visitedIds: [],
    visitedSections: [],
  };

  const crumbSegments: CrumbSegment[] = (() => {
    const segments: CrumbSegment[] = [
      {
        id: 'home',
        label: '/home',
        title: 'Scroll to top',
        onClick: () => smoothScrollTo('#top'),
        isActive: breadcrumbState.activeIndex <= 0,
        isVisited: true,
        interactive: true,
      },
    ];

    if (breadcrumbState.sections.length > 0) {
      const visited = breadcrumbState.visitedSections;
      const hasPrevious = visited.length > 1;
      const previous = hasPrevious ? visited[visited.length - 2] : null;
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
        segments.push({
          id: current.id,
          label: normalizedLabel,
          title: current.label,
          onClick: () => smoothScrollTo(`#${current.id}`),
          isActive: true,
          isVisited: breadcrumbState.visitedIds.includes(current.id),
          interactive: true,
        });

        const inferredIndex =
          breadcrumbState.activeIndex >= 0
            ? breadcrumbState.activeIndex
            : breadcrumbState.sections.findIndex((section) => section.id === current.id);
        const totalSections = breadcrumbState.sections.length;
        if (inferredIndex >= 0 && totalSections > 0) {
          const progressLabel = `/${String(inferredIndex + 1).padStart(3, '0')}`;
          segments.push({
            id: `${current.id}-step`,
            label: progressLabel,
            title: `Section ${inferredIndex + 1} of ${totalSections}`,
            isActive: true,
            isVisited: breadcrumbState.visitedIds.includes(current.id),
            interactive: false,
            kind: 'progress',
          });
        }
      }
    }

    return segments;
  })();

  const hasBreadcrumb = crumbSegments.length > 0;
  const visitedCount = breadcrumbState.visitedIds.length;
  const totalSections = breadcrumbState.sections.length || 3;
  const progressPercent = totalSections > 0 ? Math.min(100, Math.round((visitedCount / totalSections) * 100)) : 0;
  const mobileBreadcrumbText = breadcrumbState.activeSection
    ? `${breadcrumbState.activeSection.label} · ${visitedCount}/${totalSections}`
    : 'Home';

  const headerClassName = [
    'zen-header',
    isDark ? 'zen-header--dark' : 'zen-header--light',
    isScrolled ? 'zen-header--scrolled' : 'zen-header--top',
    isVisible ? 'zen-header--visible' : 'zen-header--hidden',
    isMobileMenuOpen ? 'zen-header--menu-open' : '',
  ].filter(Boolean).join(' ');

  return (
    <header className={headerClassName}>
      <div className="zen-header__atmosphere" aria-hidden="true" />
      <div className="padding-global zen-header__padding">
        <div className="container-xlarge">
          <nav className="zen-header__nav" aria-label="Primary navigation">
            <div className="zen-header__left">
              <button
                type="button"
                aria-expanded={isMobileMenuOpen}
                aria-controls="zen-primary-menu"
                className="zen-menu-trigger"
                onClick={() => setIsMobileMenuOpen((open) => !open)}
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
                onClick={onBackToLanding ? onBackToLanding : () => smoothScrollTo('#top')}
                className="zen-logo-button"
                aria-label={onBackToLanding ? 'Back to landing' : 'Things Inc home'}
                type="button"
              >
                <img
                  src="https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/66ea3a5528a044beafcf917f_Logo_Icon.svg"
                  alt="Things Inc logo"
                  loading="eager"
                />
              </button>

              {hasBreadcrumb && (
                <div className="zen-crumbs" aria-label="Section breadcrumb" role="navigation">
                  <ul className="zen-crumbs__list" role="list">
                    {crumbSegments.map((segment, index) => {
                      const isFirst = index === 0;
                      const isLast = index === crumbSegments.length - 1;
                      const interactive = segment.interactive !== false && Boolean(segment.onClick);
                      const classes = [
                        'zen-crumb',
                        segment.isActive ? 'is-active' : '',
                        segment.isVisited ? 'is-visited' : '',
                        isFirst ? 'zen-crumb--first' : 'zen-crumb--mid',
                        isLast ? 'zen-crumb--last' : '',
                        segment.kind === 'progress' ? 'zen-crumb--progress' : '',
                      ]
                        .filter(Boolean)
                        .join(' ');

                      return (
                        <li key={segment.id} className={classes}>
                          <button
                            type="button"
                            onClick={segment.onClick}
                            disabled={!interactive}
                            className="zen-crumb__button"
                            aria-label={segment.title}
                            aria-current={segment.isActive ? 'page' : undefined}
                          >
                            <span>{segment.label}</span>
                            {segment.isActive && segment.id !== 'home' && segment.kind !== 'progress' ? (
                              <span className="zen-crumb__active-indicator" aria-hidden="true" />
                            ) : null}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>

            <div className="zen-header__right">
              <div className="zen-theme-toggle" role="presentation">
                <span aria-hidden="true">Night</span>
                <button
                  type="button"
                  className="zen-theme-toggle__control"
                  onClick={toggleTheme}
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
        className={`zen-header__overlay ${isMobileMenuOpen ? 'is-visible' : ''}`}
        role="presentation"
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden={!isMobileMenuOpen}
      />

      <aside
        id="zen-primary-menu"
        className={`zen-mobile-menu ${isMobileMenuOpen ? 'is-visible' : ''}`}
        aria-hidden={!isMobileMenuOpen}
      >
        <div className="zen-mobile-menu__inner">
          <div className="zen-mobile-menu__header">
            <span className="zen-mobile-menu__eyebrow">Navigation</span>
            <button type="button" onClick={() => setIsMobileMenuOpen(false)} className="zen-mobile-menu__close">
              Close
            </button>
          </div>
          <ul className="zen-mobile-menu__links" role="list">
            {MENU_LINKS.map((link) => (
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

          <div className="zen-mobile-menu__footer">
            <div className="zen-mobile-menu__theme">
              <span>Theme</span>
              <button
                type="button"
                onClick={toggleTheme}
                className="zen-chip"
              >
                Switch to {isDark ? 'day' : 'night'}
              </button>
            </div>
            {showPwa && (
              <div className="zen-mobile-menu__actions">
                {canInstall && !isStandalone && !installed && (
                  <button type="button" className="zen-chip" onClick={() => { void promptInstall(); }}>
                    Install app
                  </button>
                )}
                {(installed || isStandalone) && (
                  <span className="zen-chip zen-chip--muted" aria-label="App installed">
                    Installed
                  </span>
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