import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
// Import global design tokens & theme styles so CSS variables are available in the JSDOM environment.
import '../styles/globals.css';

// Minimal root wrapper to simulate theme attribute switching.
function ThemeWrapper({ theme }: { theme: 'light' | 'dark'; children?: React.ReactNode }) {
  return <div data-theme={theme} className={theme === 'dark' ? 'dark' : 'light'}><div className="page-wrapper" data-testid="page" /></div>;
}

import fs from 'node:fs';
import path from 'node:path';

// This is a static assertion test: we validate the design token contract inside globals.css
// rather than relying on runtime style application (jsdom + Vite CSS transforms can omit rules).

const GLOBALS_PATH = path.resolve(__dirname, '../styles/globals.css');

describe('theme gradients', () => {
  it('globals.css defines app gradient indirection + light override', () => {
    const css = fs.readFileSync(GLOBALS_PATH, 'utf8');

    // Root: default indirection should point to night variant
    expect(css).toMatch(/--zen-gradient-app-current:\s*var\(--zen-gradient-app-night\)/);

    // Light theme override switches indirection
  expect(css).toMatch(/html\[data-theme='light']\s*{[^}]*--zen-gradient-app-current:\s*var\(--zen-gradient-app-day\)/);

    // Night & day gradient definitions exist
    expect(css).toMatch(/--zen-gradient-app-night:\s*linear-gradient\(/);
    expect(css).toMatch(/--zen-gradient-app-day:\s*linear-gradient\(/);

    // Page wrapper consumes indirection variable for background
    expect(css).toMatch(/\.page-wrapper[^}]*background:\s*var\(--zen-gradient-app-current\)/);
  // Legacy .light wrapper no longer asserted (attribute model only).
  });
});
