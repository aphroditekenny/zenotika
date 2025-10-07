import { renderHook, act } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useMilestoneNarrator } from '@/hooks/useMilestoneNarrator';

describe('useMilestoneNarrator', () => {
  it('captures milestone messages when events fire', () => {
    const { result } = renderHook(() => useMilestoneNarrator({ timeoutMs: 10000 }));
    expect(result.current.message).toBeNull();
    act(() => {
      window.dispatchEvent(new CustomEvent('zen:progress-milestone', { detail: { threshold: 50, completion: 50 } }));
    });
    expect(typeof result.current.message).toBe('string');
  expect(result.current.message).toContain('Halfway');
  });
});
