import { useEffect, useMemo, useState } from 'react';

export interface SectionDescriptor {
  id: string;
  label: string;
  crumb?: string;
  navLabel?: string;
}

interface SectionTrackerResult {
  activeSection: SectionDescriptor | null;
  activeIndex: number;
  visitedIds: string[];
  visitedSections: SectionDescriptor[];
}

/**
 * Observe the provided sections and report which one is currently active in view.
 * Designed for sticky navigation / breadcrumb UI.
 */
export function useSectionTracker(
  sections: SectionDescriptor[] | undefined,
  options: { rootMargin?: string; threshold?: number[] } = {}
): SectionTrackerResult {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [visitedIds, setVisitedIds] = useState<string[]>([]);

  const { rootMargin, threshold } = options;

  const sectionMap = useMemo(() => {
    if (!sections || sections.length === 0) {
      return new Map<string, SectionDescriptor>();
    }
    return sections.reduce((map, section) => {
      map.set(section.id, section);
      return map;
    }, new Map<string, SectionDescriptor>());
  }, [sections]);

  useEffect(() => {
    if (!sections || sections.length === 0) {
      setActiveId(null);
      setVisitedIds([]);
      return;
    }

    const fallback = () => {
      const first = sections[0];
      if (first) {
        setActiveId(first.id);
        setVisitedIds([first.id]);
      }
    };

    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
      fallback();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          if (!id) return;
          setActiveId(id);
          setVisitedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
        });
      },
      {
        rootMargin: rootMargin ?? '-45% 0px -45% 0px',
        threshold: threshold ?? [0, 0.25, 0.5, 0.75, 1],
      }
    );

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (!element) return;
      observer.observe(element);
    });

    if (sections[0]) {
      setActiveId((current) => current ?? sections[0].id);
      setVisitedIds((prev) => (prev.length > 0 ? prev : [sections[0].id]));
    }

    return () => {
      observer.disconnect();
    };
  }, [sections, rootMargin, threshold]);

  const activeSection = activeId ? sectionMap.get(activeId) ?? null : null;
  const activeIndex = sections && activeSection ? sections.findIndex((section) => section.id === activeSection.id) : -1;

  const visitedSections = useMemo(() => {
    if (!sections || sections.length === 0) {
      return [];
    }

    return sections.filter((section) => visitedIds.includes(section.id));
  }, [sections, visitedIds]);

  return {
    activeSection,
    activeIndex,
    visitedIds,
    visitedSections,
  };
}
