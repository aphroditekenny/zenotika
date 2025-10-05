import { describe, it, expect } from 'vitest';
import { persona } from '../content/persona';
import { defaultMeta } from '../content/meta';

/**
 * Lightweight guard to prevent accidental regression
 * back to old branding copy.
 */

describe('branding/persona invariants', () => {
  it('persona pillars contain expected keys & branding', () => {
    const keys = persona.pillars.map(p => p.key).sort();
    expect(keys).toEqual(['informatika', 'nova', 'zen']);
    expect(persona.brand).toBe('Zenotika');
    expect(persona.tagline.toLowerCase()).toContain('mindful');
  });

  it('meta default matches persona brand & includes keywords', () => {
    expect(defaultMeta.title).toBe('Zenotika');
    expect(defaultMeta.brand).toBe('Zenotika');
    expect(defaultMeta.keywords).toContain('performance');
  });
});
