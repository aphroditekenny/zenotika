import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from '@/App';
import { __setFeatureFlagOverride, __resetFeatureFlagOverrides } from '@/featureFlags';

describe('lazy home sections hydration behavior', () => {
  beforeEach(() => {
    __setFeatureFlagOverride('lazyHomeSections', true);
    __setFeatureFlagOverride('lazyHomePage', false); // keep page eager so we reach sections
  });

  afterEach(() => {
    __resetFeatureFlagOverrides();
  });

  it('renders (hydrates) the log book section heading after navigation with lazy sections enabled', async () => {
    // Basic IntersectionObserver polyfill for jsdom
    class IOStub {
      callback: IntersectionObserverCallback;
      constructor(cb: IntersectionObserverCallback) { this.callback = cb; }
      observe() { /* immediately invoke as intersecting */ this.callback([{ isIntersecting: true, target: document.body } as any], this as any); }
      unobserve() {}
      disconnect() {}
      takeRecords(): IntersectionObserverEntry[] { return []; }
      root = null; rootMargin = ''; thresholds: ReadonlyArray<number> = [];
    }
    (globalThis as any).IntersectionObserver = IOStub as any;

    render(<App />);
    const cta = await screen.findByRole('button', { name: /enter the zenotika core experience/i });
    cta.click();
    // Wait for the log book heading from the real dynamically imported module
    const heading = await screen.findByRole('heading', { name: /logbook of mindful progress/i }, { timeout: 6000 });
    expect(heading).toBeInTheDocument();
  });
});
