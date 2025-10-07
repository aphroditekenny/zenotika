// Centralized Zenotika persona descriptors.
// Non-UI module: import where semantic copy or analytics enrichment is needed.
// Keeping this small & tree-shakeable.

export interface PersonaPillar {
  key: 'zen' | 'nova' | 'informatika';
  title: string;
  short: string; // concise label
  description: string; // human facing
  semanticTags: string[]; // for a11y / analytics / alt text enrichment
}

export interface ZenotikaPersona {
  brand: 'Zenotika';
  tagline: string;
  mission: string;
  pillars: PersonaPillar[];
  keywords: string[];
  version: 1;
}

// The heavy data moved to personaData.ts for dynamic import.
// Keep only types here and a thin helper that dynamically loads when needed.
export type PersonaKey = 'zen' | 'nova' | 'informatika';

export async function getPillar(key: PersonaKey) {
  const mod = await import('./personaData');
  return (await mod.getPersona()).pillars.find(p => p.key === key);
}

export interface PersonaLocalizedContent {
  tagline: string;
  mission: string;
  pillars: Record<PersonaKey, {
    title: string;
    short: string;
    description: string;
  }>;
}

export async function getPersonaLocales() {
  const mod = await import('./personaData');
  return mod.getPersonaLocales();
}

// Minimal locales stub (en + id) with only fields used synchronously in tests/components
export const personaLocales: Record<'en'|'id', PersonaLocalizedContent> = {
  en: {
    tagline: 'Mindful balance, modern energy, intelligent function.',
    mission: 'Uniting mindful simplicity, modern energy, and intelligent function into a web experience that is fast, inclusive, and measurable.',
    pillars: {
      zen: { title: 'Zen', short: 'Mindful Simplicity', description: 'Balance & calm.' },
      nova: { title: 'Nova', short: 'Modern Energy', description: 'Progressive energy.' },
      informatika: { title: 'Informatika', short: 'Intelligent Function', description: 'Efficient architecture.' }
    }
  },
  id: {
    tagline: 'Keseimbangan mindful, energi modern, fungsi cerdas.',
    mission: 'Menyatukan kesederhanaan yang penuh kesadaran, energi inovatif, dan fungsi cerdas menjadi pengalaman web yang cepat, inklusif, dan terukur.',
    pillars: {
      zen: { title: 'Zen', short: 'Mindful Simplicity', description: 'Menjaga keseimbangan dan ketenangan.' },
      nova: { title: 'Nova', short: 'Modern Energy', description: 'Energi modern yang progresif.' },
      informatika: { title: 'Informatika', short: 'Intelligent Function', description: 'Arsitektur efisien.' }
    }
  }
};

// Lightweight sync stub so existing meta + tests that import { persona } keep working without awaiting.
// This keeps only minimal fields; full descriptive content stays in dynamically loaded module.
export const persona: ZenotikaPersona = {
  brand: 'Zenotika',
  tagline: 'Mindful balance, modern energy, intelligent function.',
  mission: 'Menyatukan kesederhanaan yang penuh kesadaran, energi inovatif, dan fungsi cerdas menjadi pengalaman web yang cepat, inklusif, dan terukur.',
  pillars: [
    { key: 'zen', title: 'Zen', short: 'Mindful Simplicity', description: 'Balance & calm.', semanticTags: ['balance'] },
    { key: 'nova', title: 'Nova', short: 'Modern Energy', description: 'Progressive energy.', semanticTags: ['innovation'] },
    { key: 'informatika', title: 'Informatika', short: 'Intelligent Function', description: 'Efficient architecture.', semanticTags: ['efficiency'] },
  ],
  keywords: ['zenotika', 'performance', 'react 19', 'pwa', 'accessibility'],
  version: 1
};

export async function getPersona() {
  // Dynamically load full persona for runtime rich usage.
  const mod = await import('./personaData');
  return mod.getPersona();
}
