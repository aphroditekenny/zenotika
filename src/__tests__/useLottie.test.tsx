import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, act } from '@testing-library/react';
import { useLottie } from '../hooks/useLottie';
import { animationRegistry } from '../utils/animationRegistry';

// Mock lottie-web minimal surface
const play = vi.fn();
const pause = vi.fn();
const destroy = vi.fn();
const setSpeed = vi.fn();
const addSegment = vi.fn();
const playSegments = vi.fn();
const loadAnimation = vi.fn(() => ({ play, pause, destroy, setSpeed, addSegment, playSegments }));

vi.mock('lottie-web', () => ({
  loadAnimation
}));

beforeEach(() => {
  (global as any).matchMedia = (query: string) => ({
    matches: query.includes('prefers-reduced-motion') ? false : false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  });
  const observers: any[] = [];
  (global as any).IntersectionObserver = vi.fn(function(cb: any){
    observers.push(cb);
    this.observe = vi.fn();
    this.disconnect = vi.fn();
  });
  (global as any).__observers = observers;
  (global as any).fetch = vi.fn(async () => ({ json: async () => ({ layers: [] }) }));
});

afterEach(() => {
  vi.clearAllMocks();
  animationRegistry.destroyAll();
});

function TestComponent(props: any) {
  const ref = useLottie({ id: 't1', src: '/animations/sample.json', reduceMotionAware: true, ...props });
  return <div data-testid="wrap" ref={ref} />;
}

describe('useLottie', () => {
  it('does not initialize before intersection', () => {
    render(<TestComponent />);
    expect((play as any).mock.calls.length).toBe(0);
  });

  it('initializes after intersection', async () => {
    render(<TestComponent />);
    await act(async () => { await Promise.resolve(); });
    const observers = (global as any).__observers;
    expect(observers.length).toBeGreaterThan(0);
    const obs = observers[0];
    await act(async () => { obs([{ isIntersecting: true }]); });
  expect(loadAnimation).toHaveBeenCalled();
  });

  it('applies segments when provided', async () => {
    render(<TestComponent segments={[[0,10]]} segmentIndex={0} />);
    await act(async () => { await Promise.resolve(); });
    const observers = (global as any).__observers;
    const obs = observers[0];
    await act(async () => { obs([{ isIntersecting: true }]); });
    expect(addSegment).toHaveBeenCalledWith(0, 10, false);
  });

  it('processes via worker when enabled', async () => {
    const postMessage = vi.fn();
    const terminate = vi.fn();
    const mockWorker: any = function() { return { postMessage, terminate, onmessage: null, onerror: null }; } as any;
    (global as any).Worker = vi.fn(() => mockWorker()) as any;
    render(<TestComponent useWorkerPreprocess />);
    await act(async () => { await Promise.resolve(); });
    const obs = (global as any).__observers[0];
    // Simulate worker response before intersection triggers playback
    // first trigger intersection to start worker request
    await act(async () => { obs([{ isIntersecting: true }]); });
    // Worker should have been constructed and sent message
    expect((global as any).Worker).toHaveBeenCalledTimes(1);
  });

  it('remaps colors (flat fill) using colorRemap', async () => {
    // Provide fake animation JSON with one fill color (#000000) normalized as [0,0,0]
    (global as any).fetch = vi.fn(async () => ({ json: async () => ({ layers: [{ shapes: [{ ty: 'fl', c: { k: [0,0,0] } }] }] }) }));
    render(<TestComponent colorRemap={{ '#000000': '#ffffff' }} />);
    await act(async () => { await Promise.resolve(); });
    const obs = (global as any).__observers[0];
    await act(async () => { obs([{ isIntersecting: true }]); });
    // Wait briefly for loadAnimation to be invoked
    for (let i=0; i<5 && loadAnimation.mock.calls.length === 0; i++) {
      await act(async () => { await new Promise(r => setTimeout(r, 0)); });
    }
    expect(loadAnimation.mock.calls.length).toBeGreaterThan(0);
  const firstArg: any = (loadAnimation as any).mock.calls[0][0];
    expect(firstArg.animationData.layers[0].shapes[0].c.k[0]).toBeCloseTo(1, 5); // r component now 1
  });

  it('remaps gradient stops using colorRemap', async () => {
    // Gradient shape structure with g.k.k array: [pos, r, g, b, pos, r, g, b]
    (global as any).fetch = vi.fn(async () => ({ json: async () => ({ layers: [{ shapes: [{ ty: 'gf', g: { k: { k: [0, 0,0,0, 1, 0,0,0] } } }] }] }) }));
    render(<TestComponent colorRemap={{ '#000000': '#ffffff' }} />);
    await act(async () => { await Promise.resolve(); });
    const obs = (global as any).__observers[0];
    await act(async () => { obs([{ isIntersecting: true }]); });
    for (let i=0; i<5 && loadAnimation.mock.calls.length === 0; i++) {
      await act(async () => { await new Promise(r => setTimeout(r, 0)); });
    }
    const firstArg: any = (loadAnimation as any).mock.calls[0][0];
    const gradientArr = firstArg.animationData.layers[0].shapes[0].g.k.k;
    // First stop r component replaced to ~1
    expect(gradientArr[1]).toBeCloseTo(1, 5);
    expect(gradientArr[2]).toBeCloseTo(1, 5);
    expect(gradientArr[3]).toBeCloseTo(1, 5);
  });

  it('skips when reduced motion aware & prefers-reduced-motion active', async () => {
    (global as any).matchMedia = () => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    });
    render(<TestComponent />);
    await act(async () => { await Promise.resolve(); });
    const observers = (global as any).__observers;
    // Should not register an observer when reduced motion preference active
    if (observers.length) {
      expect(observers.length).toBe(0);
    } else {
      expect(observers.length).toBe(0);
    }
    expect(loadAnimation).not.toHaveBeenCalled();
  });
});