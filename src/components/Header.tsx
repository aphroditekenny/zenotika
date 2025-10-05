import { useState, useEffect, useCallback, memo } from 'react';
import { isFeatureEnabled } from '@/featureFlags';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { useTheme } from './ThemeContext';
import { checkForUpdates } from '@/utils/swUpdates';

interface HeaderProps {
  onBackToLanding?: () => void;
}

function Header({ onBackToLanding }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { theme, toggleTheme, isDark, isLight } = useTheme();
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

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
      isVisible ? 'transform translate-y-0' : 'transform -translate-y-full'
    } ${
      isScrolled 
        ? isDark 
          ? 'bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-2xl' 
          : 'bg-white/80 backdrop-blur-xl border-b border-black/10 shadow-2xl'
        : isDark 
          ? 'bg-black/20 backdrop-blur-md' 
          : 'bg-white/20 backdrop-blur-md'
    }`}>
      <div className="padding-global stretch">
        <div className="container-xlarge">
          <nav className="flex items-center justify-between py-4 lg:py-6">
            {/* Logo - Zen approach: subtle, functional */}
            <button
              onClick={onBackToLanding ? onBackToLanding : () => smoothScrollTo('#top')}
              className="flex items-center z-50 relative group focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/50 rounded-lg"
              aria-label={onBackToLanding ? "Back to Landing" : "Things Inc Home"}
            >
              <img 
                src="https://cdn.prod.website-files.com/66ea3a5528a044beafcf913e/66ea3a5528a044beafcf917f_Logo_Icon.svg"
                alt="Things Inc Logo" 
                className="w-8 h-8 sm:w-10 sm:h-10 transition-opacity duration-200 group-hover:opacity-80"
                loading="eager"
              />
            </button>

            {/* Desktop Navigation - Zen approach: clean, minimal */}
            <div className="hidden lg:flex items-center space-x-8">
              <button
                onClick={() => smoothScrollTo('#our-things')}
                className={`zen-nav-link text-sm tracking-wide uppercase font-medium transition-colors duration-200 px-3 py-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/50 ${
                  isDark ? 'text-white/70 hover:text-white' : 'text-black/70 hover:text-black'
                }`}
              >
                Our Things
              </button>
              <button
                onClick={() => smoothScrollTo('#log-book')}
                className={`zen-nav-link text-sm tracking-wide uppercase font-medium transition-colors duration-200 px-3 py-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/50 ${
                  isDark ? 'text-white/70 hover:text-white' : 'text-black/70 hover:text-black'
                }`}
              >
                Log Book
              </button>
              <button
                onClick={() => smoothScrollTo('#newsletter')}
                className={`zen-nav-link text-sm tracking-wide uppercase font-medium transition-colors duration-200 px-3 py-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/50 ${
                  isDark ? 'text-white/70 hover:text-white' : 'text-black/70 hover:text-black'
                }`}
              >
                Newsletter
              </button>
              
              {/* Theme Toggle - Zen approach: functional, subtle */}
              <button
                onClick={toggleTheme}
                className={`zen-theme-toggle w-10 h-10 rounded-full backdrop-blur-sm border flex items-center justify-center transition-all duration-200 ml-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/50 ${
                  isDark 
                    ? 'bg-white/10 border-white/20 hover:bg-white/15' 
                    : 'bg-black/10 border-black/20 hover:bg-black/15'
                }`}
                aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
              >
                <div className="relative w-4 h-4">
                  {/* Sun Icon */}
                  <svg 
                    className={`absolute inset-0 w-4 h-4 text-yellow-500 transition-all duration-500 ${isLight ? 'scale-100 rotate-0 opacity-100' : 'scale-0 rotate-180 opacity-0'}`}
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                  
                  {/* Moon Icon */}
                  <svg 
                    className={`absolute inset-0 w-4 h-4 text-indigo-400 transition-all duration-500 ${isDark ? 'scale-100 rotate-0 opacity-100' : 'scale-0 rotate-180 opacity-0'}`}
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                </div>
              </button>

              {showPwa && canInstall && !isStandalone && (
                <button
                  onClick={() => { void promptInstall(); }}
                  className={`ml-4 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/50 ${
                    isDark ? 'bg-white/10 hover:bg-white/15 text-white' : 'bg-black/10 hover:bg-black/15 text-black'
                  }`}
                >
                  Install App
                </button>
              )}
            </div>

            {/* Mobile Menu Button - Zen approach */}
            <button
              className={`lg:hidden flex flex-col items-center justify-center w-8 h-8 space-y-1 z-50 relative transition-all duration-200 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/50 ${
                isMobileMenuOpen ? 'transform rotate-90' : ''
              }`}
              aria-label="Toggle mobile menu"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className={`block w-5 h-0.5 transition-all duration-200 ${
                isDark ? 'bg-white' : 'bg-black'
              } ${isMobileMenuOpen ? 'transform rotate-45 translate-y-1.5' : ''}`}></span>
              <span className={`block w-5 h-0.5 transition-all duration-200 ${
                isDark ? 'bg-white' : 'bg-black'
              } ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`block w-5 h-0.5 transition-all duration-200 ${
                isDark ? 'bg-white' : 'bg-black'
              } ${isMobileMenuOpen ? 'transform -rotate-45 -translate-y-1.5' : ''}`}></span>
            </button>
          </nav>

          {/* Mobile Menu */}
          <div className={`lg:hidden fixed inset-0 backdrop-blur-lg transition-all duration-300 ${
            isDark ? 'bg-black/95' : 'bg-white/95'
          } ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
            <div className="flex flex-col items-center justify-center min-h-screen space-y-8">
              <button
                onClick={() => smoothScrollTo('#our-things')}
                className={`text-2xl tracking-wide uppercase font-medium transition-colors duration-200 px-4 py-2 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/50 ${
                  isDark ? 'text-white/90 hover:text-white' : 'text-black/90 hover:text-black'
                }`}
              >
                Our Things
              </button>
              <button
                onClick={() => smoothScrollTo('#log-book')}
                className={`text-2xl tracking-wide uppercase font-medium transition-colors duration-200 px-4 py-2 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/50 ${
                  isDark ? 'text-white/90 hover:text-white' : 'text-black/90 hover:text-black'
                }`}
              >
                Log Book
              </button>
              <button
                onClick={() => smoothScrollTo('#newsletter')}
                className={`text-2xl tracking-wide uppercase font-medium transition-colors duration-200 px-4 py-2 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/50 ${
                  isDark ? 'text-white/90 hover:text-white' : 'text-black/90 hover:text-black'
                }`}
              >
                Newsletter
              </button>

              {/* Desktop Install Button / Installed badge */}
              {showPwa && canInstall && !isStandalone && !installed && (
                <button
                  onClick={() => { void promptInstall(); }}
                  className={`ml-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/50 ${
                    isDark ? 'bg-white/10 hover:bg-white/15 text-white' : 'bg-black/10 hover:bg-black/15 text-black'
                  }`}
                >
                  Install App
                </button>
              )}
              {showPwa && (installed || isStandalone) && (
                <span
                  className={`ml-2 px-3 py-2 rounded-full text-xs font-semibold ${
                    isDark ? 'bg-emerald-900/40 text-emerald-200 border border-emerald-600/40' : 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                  }`}
                  aria-label="App installed"
                >
                  Installed
                </span>
              )}

              {/* Check for Updates */}
              {showPwa && canCheckUpdates && (
                <button
                  onClick={() => { void checkForUpdates(); }}
                  className={`ml-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/50 ${
                    isDark ? 'bg-white/10 hover:bg-white/15 text-white' : 'bg-black/10 hover:bg-black/15 text-black'
                  }`}
                >
                  Check Updates
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default memo(Header);