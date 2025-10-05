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
