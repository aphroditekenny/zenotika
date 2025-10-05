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

export const persona: ZenotikaPersona = {
  brand: 'Zenotika',
  tagline: 'Mindful balance, modern energy, intelligent function.',
  mission:
    'Menyatukan kesederhanaan yang penuh kesadaran, energi inovatif, dan fungsi cerdas menjadi pengalaman web yang cepat, inklusif, dan terukur.',
  pillars: [
    {
      key: 'zen',
      title: 'Zen',
      short: 'Mindful Simplicity',
      description:
        'Menjaga keseimbangan dan ketenangan—setiap elemen hadir karena fungsi, setiap ruang bernapas untuk fokus.',
      semanticTags: ['balance', 'calm', 'clarity']
    },
    {
      key: 'nova',
      title: 'Nova',
      short: 'Modern Energy',
      description:
        'Energi modern yang progresif—mengadopsi teknologi baru dengan selektif agar relevan dan berumur panjang.',
      semanticTags: ['innovation', 'energy', 'progressive']
    },
    {
      key: 'informatika',
      title: 'Informatika',
      short: 'Intelligent Function',
      description:
        'Fungsi cerdas—arsitektur yang efisien, terukur, dan mudah dipelihara, melayani kebutuhan manusia.',
      semanticTags: ['architecture', 'efficiency', 'system']
    }
  ],
  keywords: [
    'zenotika',
    'react 19',
    'performance',
    'pwa',
    'accessibility',
    'web vitals',
    'progressive enhancement',
    'feature flags'
  ],
  version: 1
};

export type PersonaKey = typeof persona.pillars[number]['key'];

export function getPillar(key: PersonaKey): PersonaPillar | undefined {
  return persona.pillars.find(p => p.key === key);
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

export const personaLocales: Record<'en' | 'id', PersonaLocalizedContent> = {
  en: {
    tagline: 'Mindful balance, modern energy, intelligent function.',
    mission:
      'Uniting mindful simplicity, modern energy, and intelligent function into a web experience that is fast, inclusive, and measurable.',
    pillars: {
      zen: {
        title: 'Zen',
        short: 'Mindful Simplicity',
        description:
          'Sustains balance and calm—every element serves purpose and every space breathes so focus feels effortless.'
      },
      nova: {
        title: 'Nova',
        short: 'Modern Energy',
        description:
          'Infuses progressive energy—adopting new technology with discernment so experiences stay relevant and resilient.'
      },
      informatika: {
        title: 'Informatika',
        short: 'Intelligent Function',
        description:
          'Delivers intelligent function—efficient architecture that scales gracefully, remains maintainable, and champions human needs.'
      }
    }
  },
  id: {
    tagline: 'Keseimbangan mindful, energi modern, fungsi cerdas.',
    mission:
      'Menyatukan kesederhanaan yang penuh kesadaran, energi inovatif, dan fungsi cerdas menjadi pengalaman web yang cepat, inklusif, dan terukur.',
    pillars: Object.fromEntries(
      persona.pillars.map(pillar => [
        pillar.key,
        {
          title: pillar.title,
          short: pillar.short,
          description: pillar.description
        }
      ])
    ) as PersonaLocalizedContent['pillars']
  }
};
