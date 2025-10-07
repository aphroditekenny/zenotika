import { memo, ReactNode, useEffect, useState, createContext, useContext } from "react";
import { animationRegistry } from "../utils/animationRegistry";

interface AccessibilityContextType {
  reducedMotion: boolean;
  setReducedMotionOverride: (override: boolean | null) => void;
  setHighContrastOverride: (override: boolean | null) => void;
  highContrast: boolean;
  screenReaderMode: boolean;
  focusVisible: boolean;
  setFocusVisibleOverride: (override: boolean | null) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType>({
  reducedMotion: false,
  setReducedMotionOverride: () => {},
  setHighContrastOverride: () => {},
  highContrast: false,
  screenReaderMode: false,
  focusVisible: false,
  setFocusVisibleOverride: () => {},
});

export const useAccessibility = () => useContext(AccessibilityContext);

interface AccessibilityProviderProps {
  children: ReactNode;
}

const AccessibilityProvider = memo(function AccessibilityProvider({ 
  children 
}: AccessibilityProviderProps) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [reducedMotionOverride, setReducedMotionOverride] = useState<boolean | null>(null);
  const [highContrastOverride, setHighContrastOverride] = useState<boolean | null>(null);
  const [focusVisibleOverride, setFocusVisibleOverride] = useState<boolean | null>(null);
  // Load persisted override
  useEffect(() => {
    try {
      const stored = localStorage.getItem('a11y.reducedMotionOverride');
      if (stored === 'true') setReducedMotionOverride(true);
      else if (stored === 'false') setReducedMotionOverride(false);
      const hc = localStorage.getItem('a11y.highContrastOverride');
      if (hc === 'true') setHighContrastOverride(true);
      else if (hc === 'false') setHighContrastOverride(false);
      const fv = localStorage.getItem('a11y.focusVisibleOverride');
      if (fv === 'true') setFocusVisibleOverride(true);
      else if (fv === 'false') setFocusVisibleOverride(false);
    } catch { /* ignore */ }
  }, []);
  const [highContrast, setHighContrast] = useState(false);
  const [screenReaderMode, setScreenReaderMode] = useState(false);
  const [focusVisible, setFocusVisible] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  setReducedMotion(reducedMotionOverride !== null ? reducedMotionOverride : mediaQuery.matches);
    
    const handleMotionChange = (e: MediaQueryListEvent) => {
      setReducedMotion(reducedMotionOverride !== null ? reducedMotionOverride : e.matches);
    };
    
    mediaQuery.addEventListener('change', handleMotionChange);

    // Check for high contrast preference
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
  setHighContrast(highContrastOverride !== null ? highContrastOverride : contrastQuery.matches);
    
    const handleContrastChange = (e: MediaQueryListEvent) => {
      setHighContrast(highContrastOverride !== null ? highContrastOverride : e.matches);
    };
    
    contrastQuery.addEventListener('change', handleContrastChange);

    // Detect screen reader usage
    const detectScreenReader = () => {
      const hasScreenReader = window.speechSynthesis && window.speechSynthesis.getVoices().length > 0;
      setScreenReaderMode(hasScreenReader || navigator.userAgent.includes('NVDA') || navigator.userAgent.includes('JAWS'));
    };
    
    detectScreenReader();
    
    // Focus-visible detection
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (focusVisibleOverride === null) setFocusVisible(true);
      }
    };
    
    const handleMouseDown = () => {
      if (focusVisibleOverride === null) setFocusVisible(false);
    };
    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    // Set accessibility attributes
  document.documentElement.setAttribute('data-reduced-motion', reducedMotion.toString());
  document.documentElement.setAttribute('data-high-contrast', highContrast.toString());
  document.documentElement.setAttribute('data-screen-reader', screenReaderMode.toString());
  document.documentElement.setAttribute('data-focus-visible', focusVisible.toString());

    // Broadcast to animations (pause/resume) when reduced motion changes
    if (reducedMotion) {
      animationRegistry.pauseAll();
    } else {
      animationRegistry.playAll();
    }

    return () => {
      mediaQuery.removeEventListener('change', handleMotionChange);
      contrastQuery.removeEventListener('change', handleContrastChange);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [reducedMotion, highContrast, screenReaderMode, focusVisible]);

  // Apply override changes immediately
  useEffect(() => {
    if (reducedMotionOverride !== null) {
      setReducedMotion(reducedMotionOverride);
      try { localStorage.setItem('a11y.reducedMotionOverride', String(reducedMotionOverride)); } catch { /* ignore */ }
    } else {
      try { localStorage.removeItem('a11y.reducedMotionOverride'); } catch { /* ignore */ }
    }
  }, [reducedMotionOverride]);

  useEffect(() => {
    if (highContrastOverride !== null) {
      setHighContrast(highContrastOverride);
      try { localStorage.setItem('a11y.highContrastOverride', String(highContrastOverride)); } catch { /* ignore */ }
    } else {
      try { localStorage.removeItem('a11y.highContrastOverride'); } catch { /* ignore */ }
    }
  }, [highContrastOverride]);

  useEffect(() => {
    if (focusVisibleOverride !== null) {
      setFocusVisible(focusVisibleOverride);
      try { localStorage.setItem('a11y.focusVisibleOverride', String(focusVisibleOverride)); } catch { /* ignore */ }
    } else {
      try { localStorage.removeItem('a11y.focusVisibleOverride'); } catch { /* ignore */ }
    }
  }, [focusVisibleOverride]);

  // Skip link for keyboard navigation
  useEffect(() => {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link';
    skipLink.setAttribute('aria-label', 'Skip to main content');
    
    document.body.insertBefore(skipLink, document.body.firstChild);

    return () => {
      if (document.body.contains(skipLink)) {
        document.body.removeChild(skipLink);
      }
    };
  }, []);

  // Announce page changes to screen readers
  useEffect(() => {
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.id = 'page-announcer';
    
    document.body.appendChild(announcer);

    return () => {
      if (document.body.contains(announcer)) {
        document.body.removeChild(announcer);
      }
    };
  }, []);

  const value = {
    reducedMotion,
    setReducedMotionOverride,
    setHighContrastOverride,
    highContrast,
    screenReaderMode,
    focusVisible,
    setFocusVisibleOverride,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
});

export default AccessibilityProvider;