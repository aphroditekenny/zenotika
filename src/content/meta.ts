// Central meta defaults referencing persona. Keep framework-agnostic.
// Future i18n: extend MetaLocaleMap and add resolveMeta(locale).
import { persona } from './persona';
import { metaID } from './meta.id';

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
    'Zenotika — Mindful balance, modern energy, intelligent function. Menyatukan kesederhanaan yang penuh kesadaran, energi inovatif, dan fungsi cerdas menjadi pengalaman web yang cepat, inklusif, dan terukur.',
  canonical: baseCanonical,
  keywords: persona.keywords,
  author: 'aphroditekenny',
  brand: persona.brand
};

export type MetaLocale = 'en' | 'id';

export const localeMeta: Record<MetaLocale, SiteMeta> = {
  en: defaultMeta,
  id: {
    ...defaultMeta,
    title: metaID.title,
    description: metaID.description,
    canonical: metaID.canonical,
    keywords: metaID.keywords,
    brand: persona.brand
  }
};

export function resolveMeta(locale: string = 'en', overrides: Partial<SiteMeta> = {}): SiteMeta {
  const normalizedLocale = (locale.split('-')[0] || 'en') as MetaLocale;
  const base = localeMeta[normalizedLocale] ?? defaultMeta;
  return { ...base, ...overrides };
}

// Simple helper for runtime injection (if needed in future hydration / SSR scenario)
export function buildMeta(overrides: Partial<SiteMeta> = {}): SiteMeta {
  return resolveMeta('en', overrides);
}
