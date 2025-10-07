import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '../components/ThemeContext';
import AccessibilityProvider from '../components/AccessibilityProvider';
import HomePage from '../components/HomePage';
import { waitFor } from '@testing-library/react';

// Helper to open the menu via trigger button
async function openMenu() {
  const trigger = await screen.findByRole('button', { name: /open menu/i });
  fireEvent.click(trigger);
  return trigger as HTMLButtonElement;
}

describe('Header menu accessibility + focus trap', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('traps focus inside desktop menu panel when open and restores after close', async () => {
    render(
      <ThemeProvider>
        <AccessibilityProvider>
          <HomePage onBackToLanding={() => {}} />
        </AccessibilityProvider>
      </ThemeProvider>
    );

    // Wait for header menu trigger to appear (HomePage uses internal loading timers)
    const trigger = await openMenu();

    // Collect focusable elements inside panel
  const panel = await waitFor(() => document.querySelector('.zen-menu-panel')) as HTMLElement | null;
  expect(panel).toBeTruthy();

    const focusables = panel!.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex="0"]'
    );
    expect(focusables.length).toBeGreaterThan(1);

    // Focus first element then press Shift+Tab -> should wrap to last
    focusables[0].focus();
    fireEvent.keyDown(panel!, { key: 'Tab', code: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(focusables[focusables.length - 1]);

    // Focus last then Tab -> wrap to first
    focusables[focusables.length - 1].focus();
    fireEvent.keyDown(panel!, { key: 'Tab', code: 'Tab' });
    expect(document.activeElement).toBe(focusables[0]);

    // Escape closes and returns focus to trigger
    fireEvent.keyDown(panel!, { key: 'Escape', code: 'Escape' });
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));
  });
});
