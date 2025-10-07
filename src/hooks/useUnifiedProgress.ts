import { useEffect, useMemo, useState } from 'react';
import { HUNT_ITEMS, HUNT_STORAGE_KEY, HUNT_PROGRESS_EVENT, DEFAULT_COLLECTED_IDS, HuntProgressDetail } from '@/data/huntItems';

interface UnifiedProgressInput {
  visitedCount: number;
  totalSections: number;
}

interface UnifiedProgressResult {
  visitedCount: number;
  totalSections: number;
  collectedCount: number;
  totalCollectibles: number;
  // 0-100 integer combined completion (simple average for now)
  completion: number;
  explorationPercent: number;
  collectionPercent: number;
  statusLine: string; // Narrative + accessible summary
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
export function useUnifiedProgress({ visitedCount, totalSections }: UnifiedProgressInput): UnifiedProgressResult {
  const [collectedSet, setCollectedSet] = useState<Set<string>>(() => readCollectedSet());

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
  const completion = Math.round(((explorationPercent + collectionPercent) / 2));

  const statusLine = useMemo(() => {
    // Example: Exploration 03/08 • Relics 04/06 • System 47%
    const visited = String(visitedCount).padStart(2, '0');
    const totalSec = String(totalSections).padStart(2, '0');
    const coll = String(collectedCount).padStart(2, '0');
    const totalCol = String(totalCollectibles).padStart(2, '0');
    return `Exploration ${visited}/${totalSec} · Relics ${coll}/${totalCol} · System ${completion}%`; // Keep separators textual for AT clarity.
  }, [visitedCount, totalSections, collectedCount, totalCollectibles, completion]);

  return {
    visitedCount,
    totalSections,
    collectedCount,
    totalCollectibles,
    completion,
    explorationPercent,
    collectionPercent,
    statusLine,
  };
}
