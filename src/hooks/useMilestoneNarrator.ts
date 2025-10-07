import { useEffect, useState } from 'react';
import { MICROCOPY } from '@/content/microcopy';

interface MilestoneNarratorOptions {
  timeoutMs?: number;
  enable?: boolean;
}

// Map milestone thresholds -> microcopy keys (system variant used, fallback to plain)
const MILESTONE_KEY_MAP: Record<number, string> = {
  25: 'milestone25',
  50: 'milestone50',
  75: 'milestone75',
  100: 'milestone100'
};

export function useMilestoneNarrator(opts: MilestoneNarratorOptions = {}) {
  const { timeoutMs = 3200, enable = true } = opts;
  const [message, setMessage] = useState<string | null>(null);
  const [threshold, setThreshold] = useState<number | null>(null);

  useEffect(() => {
    if (!enable) return;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { threshold: number; completion: number };
      if (!detail) return;
      const key = MILESTONE_KEY_MAP[detail.threshold];
      if (!key) return;
      const entry = MICROCOPY[key];
      if (!entry) return;
      const text = entry.system || entry.plain || '';
      if (!text) return;
      setThreshold(detail.threshold);
      setMessage(text);
    };
    window.addEventListener('zen:progress-milestone', handler as EventListener);
    return () => window.removeEventListener('zen:progress-milestone', handler as EventListener);
  }, [enable]);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => { setMessage(null); setThreshold(null); }, timeoutMs);
    return () => clearTimeout(t);
  }, [message, timeoutMs]);

  return { message, threshold };
}
