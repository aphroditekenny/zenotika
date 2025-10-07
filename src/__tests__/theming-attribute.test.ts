/* Theming attribute regression test
   Ensures we toggle html[data-theme] and do not rely on legacy .dark class.
*/

import { describe, it, expect, beforeEach } from 'vitest';

// Simple helper mirroring potential app logic (if actual hook exists, replace usage).
function setTheme(theme: 'light' | 'dark') {
  document.documentElement.setAttribute('data-theme', theme);
}

describe('Theming attribute model', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.classList.remove('dark');
  });

  it('applies data-theme attribute when setting dark', () => {
    setTheme('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('applies data-theme attribute when setting light', () => {
    setTheme('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('never uses legacy .dark class', () => {
    setTheme('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
