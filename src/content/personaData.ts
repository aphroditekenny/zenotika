// Dynamically loaded persona data to reduce main bundle weight.
// Provides async accessors returning the same shapes as original static exports.
import type { PersonaPillar, ZenotikaPersona, PersonaLocalizedContent, PersonaKey } from './persona';

export interface PersonaDataModule {
  persona: ZenotikaPersona;
  personaLocales: Record<'en'|'id', PersonaLocalizedContent>;
}

// Inline the data (copied from persona.ts) but keep this file isolated for code-splitting.
const data: PersonaDataModule = {
  persona: {
    brand: 'Zenotika',
    tagline: 'Mindful balance, modern energy, intelligent function.',
    mission: 'Menyatukan kesederhanaan yang penuh kesadaran, energi inovatif, dan fungsi cerdas menjadi pengalaman web yang cepat, inklusif, dan terukur.',
    pillars: [
      { key: 'zen', title: 'Zen', short: 'Mindful Simplicity', description: 'Menjaga keseimbangan dan ketenangan—setiap elemen hadir karena fungsi, setiap ruang bernapas untuk fokus.', semanticTags: ['balance','calm','clarity'] },
      { key: 'nova', title: 'Nova', short: 'Modern Energy', description: 'Energi modern yang progresif—mengadopsi teknologi baru dengan selektif agar relevan dan berumur panjang.', semanticTags: ['innovation','energy','progressive'] },
      { key: 'informatika', title: 'Informatika', short: 'Intelligent Function', description: 'Fungsi cerdas—arsitektur yang efisien, terukur, dan mudah dipelihara, melayani kebutuhan manusia.', semanticTags: ['architecture','efficiency','system'] },
    ],
    keywords: ['zenotika','react 19','performance','pwa','accessibility','web vitals','progressive enhancement','feature flags'],
    version: 1,
  },
  personaLocales: {
    en: {
      tagline: 'Mindful balance, modern energy, intelligent function.',
      mission: 'Uniting mindful simplicity, modern energy, and intelligent function into a web experience that is fast, inclusive, and measurable.',
      pillars: {
        zen: { title: 'Zen', short: 'Mindful Simplicity', description: 'Sustains balance and calm—every element serves purpose and every space breathes so focus feels effortless.' },
        nova: { title: 'Nova', short: 'Modern Energy', description: 'Infuses progressive energy—adopting new technology with discernment so experiences stay relevant and resilient.' },
        informatika: { title: 'Informatika', short: 'Intelligent Function', description: 'Delivers intelligent function—efficient architecture that scales gracefully, remains maintainable, and champions human needs.' },
      }
    },
    id: {
      tagline: 'Keseimbangan mindful, energi modern, fungsi cerdas.',
      mission: 'Menyatukan kesederhanaan yang penuh kesadaran, energi inovatif, dan fungsi cerdas menjadi pengalaman web yang cepat, inklusif, dan terukur.',
      pillars: Object.fromEntries(
        [
          ['zen', { title: 'Zen', short: 'Mindful Simplicity', description: 'Menjaga keseimbangan dan ketenangan—setiap elemen hadir karena fungsi, setiap ruang bernapas untuk fokus.' }],
          ['nova', { title: 'Nova', short: 'Modern Energy', description: 'Energi modern yang progresif—mengadopsi teknologi baru dengan selektif agar relevan dan berumur panjang.' }],
          ['informatika', { title: 'Informatika', short: 'Intelligent Function', description: 'Fungsi cerdas—arsitektur yang efisien, terukur, dan mudah dipelihara, melayani kebutuhan manusia.' }],
        ] as [PersonaKey, { title:string; short:string; description:string }][]
      ) as PersonaLocalizedContent['pillars']
    }
  }
};

export async function loadPersonaData(): Promise<PersonaDataModule> {
  return data; // synchronous resolution but kept async for future remote loading
}

export async function getPersona() {
  return (await loadPersonaData()).persona;
}

export async function getPersonaLocales() {
  return (await loadPersonaData()).personaLocales;
}

export async function getPillarAsync(key: PersonaKey) {
  const p = (await getPersona()).pillars.find(pl => pl.key === key);
  return p;
}

export type { PersonaPillar, ZenotikaPersona };