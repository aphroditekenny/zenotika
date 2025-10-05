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

describe('WebVitalsBadge CLS averaging', () => {
  beforeEach(() => {
    performanceCollector.reset();
    sessionStorage.clear();
  });

  it('persists and shows CLS average', async () => {
    render(<WebVitalsBadge />);
    act(() => {
      pushMetric('CLS', 0.05);
      pushMetric('CLS', 0.10);
      pushMetric('CLS', 0.20);
    });
  const clsChip = await screen.findByLabelText(/CLS 0\.2/);
  expect(clsChip).toBeTruthy();
    // average should be (0.05+0.10+0.20)/3 = 0.1167 -> 0.117
    const avg = await screen.findByText(/avg:.*CLS 0\.117/);
    expect(avg).toBeTruthy();
    // Re-mount to assert persistence
    performanceCollector.reset();
    render(<WebVitalsBadge />);
    // sessionStorage still has samples
    const avgPersist = await screen.findByText(/avg:.*CLS 0\.117/);
    expect(avgPersist).toBeTruthy();
  });
});
