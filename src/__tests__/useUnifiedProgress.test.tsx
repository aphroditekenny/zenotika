import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useUnifiedProgress } from '@/hooks/useUnifiedProgress';
import { HUNT_ITEMS, HUNT_PROGRESS_EVENT, HUNT_STORAGE_KEY } from '@/data/huntItems';

// Helper to set hunt progress in localStorage
function setCollected(ids: string[]) {
  window.localStorage.setItem(HUNT_STORAGE_KEY, JSON.stringify(ids));
  window.dispatchEvent(new CustomEvent(HUNT_PROGRESS_EVENT, { detail: { collected: ids } }));
}

describe('useUnifiedProgress', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('computes weighted completion with defaults (60/40)', () => {
    // Exploration: 4/8 => 50%; Collection: 3/6 => 50%; Weighted => 50%
    const halfCollected = HUNT_ITEMS.slice(0, 3).map(i => i.id);
    setCollected(halfCollected);
    const { result } = renderHook(() => useUnifiedProgress({ visitedCount: 4, totalSections: 8 }));
    expect(result.current.explorationPercent).toBeCloseTo(50);
    expect(result.current.collectionPercent).toBeCloseTo(50);
    expect(result.current.completion).toBe(50);
  });

  it('applies custom weighting', () => {
    // Exploration 100%, Collection 0%, weights 0.2 / 0.8 => completion 20
    setCollected([]); // none collected
    const { result } = renderHook(() => useUnifiedProgress({ visitedCount: 8, totalSections: 8 }, { explorationWeight: 0.2, collectionWeight: 0.8 }));
    expect(result.current.explorationPercent).toBe(100);
    expect(result.current.collectionPercent).toBe(0);
    expect(result.current.completion).toBe(20);
  });

  it('applies adaptive weighting (late phase shifts weight to collection)', () => {
    // Late exploration (>=80%) and partial collection should produce completion < explorationPercent due to higher collection weight.
    setCollected(HUNT_ITEMS.slice(0,3).map(i=>i.id)); // 50% collection
    const { result } = renderHook(() => useUnifiedProgress({ visitedCount: 8, totalSections: 8 }, { adaptiveWeighting: true }));
    expect(result.current.explorationPercent).toBe(100);
    expect(result.current.collectionPercent).toBeCloseTo(50);
    // With adaptive late weights 0.4 / 0.6 => completion = 100*0.4 + 50*0.6 = 70
    expect(result.current.completion).toBe(70);
    expect(result.current.weightingStrategy).toBe('adaptive');
  });

  it('fires milestone events once when thresholds crossed', () => {
    const milestones: number[] = [];
    const handler = (e: Event) => { milestones.push((e as CustomEvent).detail.threshold); };
    window.addEventListener('zen:progress-milestone', handler as EventListener);

    setCollected([]);
    const { rerender } = renderHook(({ visited, total }: { visited: number; total: number }) => {
      return useUnifiedProgress({ visitedCount: visited, totalSections: total });
    }, { initialProps: { visited: 1, total: 8 } });

    // Simulate progress increments with explicit collection updates (outside render cycle) to avoid infinite loops.
    act(() => { setCollected(HUNT_ITEMS.slice(0,2).map(i=>i.id)); rerender({ visited: 2, total: 8 }); }); // ~25%
    act(() => { setCollected(HUNT_ITEMS.slice(0,3).map(i=>i.id)); rerender({ visited: 4, total: 8 }); }); // ~50%
    act(() => { setCollected(HUNT_ITEMS.slice(0,5).map(i=>i.id)); rerender({ visited: 6, total: 8 }); }); // ~75%
    act(() => { setCollected(HUNT_ITEMS.slice(0,6).map(i=>i.id)); rerender({ visited: 8, total: 8 }); }); // 100%

    expect(new Set(milestones)).toEqual(new Set([25,50,75,100]));
    window.removeEventListener('zen:progress-milestone', handler as EventListener);
  });
});
