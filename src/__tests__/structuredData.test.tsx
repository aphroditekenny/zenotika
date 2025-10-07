import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import App from '@/App';

/**
 * Structured Data tests
 * Verifies JSON-LD script tags are injected and contain parseable JSON with required @type fields.
 */

describe('StructuredData JSON-LD', () => {
  it('injects core JSON-LD script tags with valid JSON payloads', () => {
    render(<App />);

    const ids = ['ld-org','ld-website','ld-app','ld-breadcrumbs','ld-webpage'];
    const found: Record<string, any> = {};

    for (const id of ids) {
      const el = document.getElementById(id);
      expect(el, `Expected script with id=${id} to exist`).toBeTruthy();
      expect(el?.getAttribute('type')).toBe('application/ld+json');
      // Ensure valid JSON
      const parsed = JSON.parse(el!.textContent || '{}');
      found[id] = parsed;
      expect(parsed['@context']).toBe('https://schema.org');
      expect(parsed['@type'], `@type missing for ${id}`).toBeTruthy();
    }

    // Specific shape checks
    expect(found['ld-org'].name).toBeTruthy();
    expect(found['ld-website'].potentialAction?.['@type']).toBe('SearchAction');
    expect(found['ld-webpage'].url).toContain(found['ld-website'].url);
  });
});
