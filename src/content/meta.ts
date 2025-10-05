// Central meta defaults referencing persona. Keep framework-agnostic.
// Future i18n: extend MetaLocaleMap and add resolveMeta(locale).
import { persona } from './persona';

export interface SiteMeta {
  title: string;
  description: string;
  canonical: string;
  keywords: string[];
  author: string;
  brand: string;
}

export const baseCanonical = 'https://aphroditekenny.github.io/zenotika/';

export const defaultMeta: SiteMeta = {
  title: persona.brand,
  description:
    'Zenotika – React 19 progressive web experience berfokus pada performa, aksesibilitas, dan desain berniat baik.',
  canonical: baseCanonical,
  keywords: persona.keywords,
  author: 'aphroditekenny',
  brand: persona.brand
};

// Simple helper for runtime injection (if needed in future hydration / SSR scenario)
export function buildMeta(overrides: Partial<SiteMeta> = {}): SiteMeta {
  return { ...defaultMeta, ...overrides };
}
