import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import React from 'react';
import { WebVitalsBadge } from '../App';
import { performanceCollector } from '../utils/performanceCollector';

function pushMetric(name: string, value: number) {
  performanceCollector.record({
    name,
    value,
    id: name + '-' + Math.random().toString(36).slice(2),
    rating: 'good',
    delta: value,
  } as any);
}

describe('WebVitalsBadge timeline', () => {
  beforeEach(() => {
    performanceCollector.reset();
    sessionStorage.clear();
  });

  it('toggles timeline panel and lists events', async () => {
    render(<WebVitalsBadge />);
    act(() => {
      pushMetric('LCP', 1200);
      pushMetric('INP', 180);
      pushMetric('CLS', 0.09);
    });
    const toggle = await screen.findByRole('button', { name: /timeline/i });
    expect(toggle).toBeTruthy();
    fireEvent.click(toggle);
  const panel = await screen.findByRole('region', { name: /web vitals timeline/i });
  expect(panel).toBeTruthy();
  const lcpEntry = await screen.findAllByText(/LCP/);
    expect(lcpEntry).toBeTruthy();
  });
});
