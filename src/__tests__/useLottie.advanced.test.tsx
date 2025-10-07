import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, act } from '@testing-library/react';
import { useLottie } from '../hooks/useLottie';

const loadAnimation = vi.fn(() => ({
  play: vi.fn(), pause: vi.fn(), destroy: vi.fn(), setSpeed: vi.fn(), addSegment: vi.fn(), playSegments: vi.fn(),
  addEventListener: vi.fn((evt, cb) => { (loadAnimation as any)._events[evt] = cb; }),
  removeEventListener: vi.fn(),
}));
(loadAnimation as any)._events = {};

vi.mock('lottie-web', () => ({ loadAnimation }));

beforeEach(() => {
  (global as any).matchMedia = () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() });
  const observers: any[] = [];
  (global as any).IntersectionObserver = vi.fn(function(cb: any){ observers.push(cb); this.observe=vi.fn(); this.disconnect=vi.fn(); });
  (global as any).__observers = observers;
  (global as any).fetch = vi.fn(async () => ({ json: async () => ({ layers: new Array(70).fill(0).map((_,i)=>({ nm: 'L'+i })) }) }));
  (loadAnimation as any)._events = {};
});

afterEach(() => { vi.clearAllMocks(); });

function TestComponent(props: any) {
  const ref = useLottie({ id: 'adv', src: '/animations/heavy.json', adaptivePerformance: true, useWorkerPreprocess: false, ...props });
  return <div ref={ref} />;
}

describe('useLottie advanced', () => {
  it('invokes event hooks', async () => {
    const onLoop = vi.fn();
    const onComplete = vi.fn();
    render(<TestComponent onLoopComplete={onLoop} onComplete={onComplete} />);
    await act(async () => { await Promise.resolve(); });
    const obs = (global as any).__observers[0];
    await act(async () => { obs([{ isIntersecting: true }]); });
    // Simulate events
    (loadAnimation as any)._events.loopComplete?.();
    (loadAnimation as any)._events.complete?.();
    expect(onLoop).toHaveBeenCalled();
    expect(onComplete).toHaveBeenCalled();
  });

  it('applies adaptive performance speed reduction on heavy animation', async () => {
    render(<TestComponent colorRemap={{ '#000000': '#ffffff' }} />);
    await act(async () => { await Promise.resolve(); });
    const obs = (global as any).__observers[0];
    await act(async () => { obs([{ isIntersecting: true }]); });
    // Load args
    const anim = loadAnimation.mock.results[0].value;
    // Expect setSpeed called with lowered value (0.8) per heuristic or initial speed
    const setSpeedCalls = anim.setSpeed.mock.calls.map((c: any[]) => c[0]);
    expect(setSpeedCalls).toContain(0.8);
  });

  it('loops only the selected segment when segmentLoop enabled', async () => {
    const playSegments = vi.fn();
    (loadAnimation as any).mockImplementation(() => ({
      play: vi.fn(), pause: vi.fn(), destroy: vi.fn(), setSpeed: vi.fn(), addSegment: vi.fn(), playSegments,
      addEventListener: vi.fn((evt: string, cb: any) => { (loadAnimation as any)._events[evt] = cb; }),
      removeEventListener: vi.fn(),
    }));
    render(<TestComponent segments={[[0,20],[21,40]]} segmentIndex={1} segmentLoop autoplay loop />);
    await act(async () => { await Promise.resolve(); });
    const obs = (global as any).__observers[0];
    await act(async () => { obs([{ isIntersecting: true }]); });
    // initial playSegments for segmentIndex
    expect(playSegments).toHaveBeenCalledWith([21,40], true);
    // simulate loopComplete
    (loadAnimation as any)._events.loopComplete?.();
    expect(playSegments).toHaveBeenLastCalledWith([21,40], true);
  });
});