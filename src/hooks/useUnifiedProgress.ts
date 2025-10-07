import { useEffect, useMemo, useRef, useState } from 'react';
import { HUNT_ITEMS, HUNT_STORAGE_KEY, HUNT_PROGRESS_EVENT, DEFAULT_COLLECTED_IDS, HuntProgressDetail } from '@/data/huntItems';
import { renderProgressVoice } from '@/content/microcopy';
import { track } from '@/utils/analytics';

interface UnifiedProgressInput { visitedCount: number; totalSections: number; }

export interface UnifiedProgressOptions {
  explorationWeight?: number; // manual weight (ignored if adaptiveWeighting true)
  collectionWeight?: number;  // manual weight (ignored if adaptiveWeighting true)
  milestoneThresholds?: number[]; // list of completion % for milestone events
  terminalStyle?: boolean; // whether to produce terminal flavored statusLineTerminal
  adaptiveWeighting?: boolean; // dynamic shift weights by exploration phase
  analytics?: boolean; // emit analytics events (progress_update, progress_milestone)
  progressEventGranularity?: number; // minimum percent delta to emit progress_update (default 5)
}

export interface UnifiedProgressResult {
  visitedCount: number;
  totalSections: number;
  collectedCount: number;
  totalCollectibles: number;
  completion: number;               // weighted 0..100
  explorationPercent: number;       // float 0..100
  collectionPercent: number;        // float 0..100
  statusLine: string;               // plain accessible summary
  statusLineTerminal: string;       // stylized (may be same as plain if option off)
  explorationWeight: number;
  collectionWeight: number;
  weightingStrategy: 'manual' | 'adaptive';
}

// Reads hunt progress from localStorage (SSR safe) with graceful fallback.
function readCollectedSet(): Set<string> {
  if (typeof window === 'undefined') return new Set(DEFAULT_COLLECTED_IDS);
  try {
    const raw = window.localStorage.getItem(HUNT_STORAGE_KEY);
    if (!raw) return new Set(DEFAULT_COLLECTED_IDS);
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return new Set(parsed.filter((x): x is string => typeof x === 'string'));
    }
  } catch {
    // ignore
  }
  return new Set(DEFAULT_COLLECTED_IDS);
}

/**
 * Combine section exploration progress & scavenger hunt collection into a unified metric.
 * Currently uses a simple arithmetic mean. Future: weight, decay, or phase-aware scaling.
 */
export function useUnifiedProgress({ visitedCount, totalSections }: UnifiedProgressInput, options?: UnifiedProgressOptions): UnifiedProgressResult {
  const [collectedSet, setCollectedSet] = useState<Set<string>>(() => readCollectedSet());
  const lastCompletionRef = useRef<number>(0);
  const lastReportRef = useRef<number>(0);
  const firedMilestonesRef = useRef<Set<number>>(new Set());

  // Preliminary static weights (may be overridden if adaptive)
  let explorationWeightRaw = options?.explorationWeight ?? 0.6;
  let collectionWeightRaw = options?.collectionWeight ?? 0.4;
  let weightingStrategy: 'manual' | 'adaptive' = 'manual';
  const milestoneThresholds = (options?.milestoneThresholds ?? [25, 50, 75, 100]).sort((a,b)=>a-b);
  const analyticsEnabled = options?.analytics !== false; // default true
  const progressGranularity = Math.max(1, options?.progressEventGranularity ?? 5);

  // Subscribe to hunt progress mutation events so header reflects live changes without prop drilling.
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<HuntProgressDetail>).detail;
      if (detail && Array.isArray(detail.collected)) {
        setCollectedSet(new Set(detail.collected));
      } else {
        setCollectedSet(readCollectedSet());
      }
    };
    window.addEventListener(HUNT_PROGRESS_EVENT, handler as EventListener);
    return () => window.removeEventListener(HUNT_PROGRESS_EVENT, handler as EventListener);
  }, []);

  const totalCollectibles = HUNT_ITEMS.length;
  const collectedCount = collectedSet.size;

  const explorationPercent = totalSections > 0 ? (visitedCount / totalSections) * 100 : 0;
  const collectionPercent = totalCollectibles > 0 ? (collectedCount / totalCollectibles) * 100 : 0;

  if (options?.adaptiveWeighting) {
    // Shift focus toward exploration early; toward collection late.
    // Phase thresholds can be refined later or made configurable.
    if (explorationPercent < 50) {
      explorationWeightRaw = 0.65; collectionWeightRaw = 0.35;
    } else if (explorationPercent < 80) {
      explorationWeightRaw = 0.55; collectionWeightRaw = 0.45;
    } else {
      explorationWeightRaw = 0.4; collectionWeightRaw = 0.6;
    }
    weightingStrategy = 'adaptive';
  }

  const weightSum = explorationWeightRaw + collectionWeightRaw || 1;
  const explorationWeight = explorationWeightRaw / weightSum;
  const collectionWeight = collectionWeightRaw / weightSum;
  const completion = Math.round((explorationPercent * explorationWeight) + (collectionPercent * collectionWeight));

  // Milestone dispatch (only when crossing upward and only once per threshold)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    milestoneThresholds.forEach(threshold => {
      if (completion >= threshold && !firedMilestonesRef.current.has(threshold)) {
        firedMilestonesRef.current.add(threshold);
        const detail = { threshold, completion };
        window.dispatchEvent(new CustomEvent('zen:progress-milestone', { detail }));
        if (analyticsEnabled) {
          track('progress_milestone', { threshold, completion, weights: { explorationWeight, collectionWeight }, strategy: weightingStrategy });
        }
      }
    });
    lastCompletionRef.current = completion;
  }, [completion, milestoneThresholds, analyticsEnabled, explorationWeight, collectionWeight, weightingStrategy]);

  // Emit progress_update events & analytics when crossing granularity thresholds
  useEffect(() => {
    if (!analyticsEnabled) return;
    const last = lastReportRef.current;
    if (Math.abs(completion - last) >= progressGranularity) {
      lastReportRef.current = completion;
      track('progress_update', {
        completion,
        explorationPercent: Math.round(explorationPercent),
        collectionPercent: Math.round(collectionPercent),
        weights: { explorationWeight, collectionWeight },
        strategy: weightingStrategy
      });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('zen:progress-update', { detail: {
          completion,
          explorationPercent,
            collectionPercent,
            explorationWeight,
            collectionWeight,
            strategy: weightingStrategy
        }}));
      }
    }
  }, [completion, explorationPercent, collectionPercent, analyticsEnabled, progressGranularity, explorationWeight, collectionWeight, weightingStrategy]);

  const statusLine = useMemo(() => {
    return renderProgressVoice({
      visited: visitedCount,
      totalSec: totalSections,
      collected: collectedCount,
      totalCol: totalCollectibles,
      completion,
      system: false
    });
  }, [visitedCount, totalSections, collectedCount, totalCollectibles, completion]);

  const statusLineTerminal = useMemo(() => {
    if (options?.terminalStyle === false) return statusLine;
    return renderProgressVoice({
      visited: visitedCount,
      totalSec: totalSections,
      collected: collectedCount,
      totalCol: totalCollectibles,
      completion,
      system: true
    });
  }, [statusLine, options?.terminalStyle, visitedCount, totalSections, collectedCount, totalCollectibles, completion]);

  return {
    visitedCount,
    totalSections,
    collectedCount,
    totalCollectibles,
    completion,
    explorationPercent,
    collectionPercent,
    statusLine,
    statusLineTerminal,
    explorationWeight,
    collectionWeight,
    weightingStrategy,
  };
}
