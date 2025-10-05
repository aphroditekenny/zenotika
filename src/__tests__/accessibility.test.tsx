import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { axe } from 'vitest-axe';
import App from '../App';

describe('App accessibility', () => {
  it('renders primary regions without violations', async () => {
    const { container } = render(<App />);

  // Ensure key regions appear before running axe to catch rendering regressions.
  expect(screen.getAllByRole('main').length).toBeGreaterThan(0);

    const results = await axe(container, {
      rules: {
        'color-contrast': { enabled: false },
      },
    });

    const seriousViolations = results.violations.filter((violation) =>
      ['serious', 'critical'].includes(violation.impact ?? '')
    );

    expect(seriousViolations).toHaveLength(0);
  });
});
