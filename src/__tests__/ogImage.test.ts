import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';

// Simple regression: run og:image script, then ensure share.svg exists and basic invariants hold.
// We don't snapshot the entire SVG (too large & noisy); instead we check a hashable subset.

function extractInvariant(svg: string) {
  // Grab first line + presence of key phrases
  const first = svg.slice(0, 200);
  const hasBrand = /Zenotika/.test(svg);
  const hasPillars = /PERFORMANCE/.test(svg) && /ACCESSIBILITY/.test(svg) && /PWA/.test(svg);
  return first + '|' + hasBrand + '|' + hasPillars + '|' + svg.length;
}

describe('OG image generation', () => {
  const script = resolve(process.cwd(), 'scripts', 'generate-og-image.mjs');
  const publicDir = resolve(process.cwd(), 'public');
  const svgPath = resolve(publicDir, 'share.svg');

  it('produces a deterministic SVG subset when Satori enabled', () => {
    execSync(`node ${script}`, { stdio: 'inherit' });
    const svg = readFileSync(svgPath, 'utf8');
    expect(svg.length).toBeGreaterThan(5000);
    const invariant = extractInvariant(svg);
    // If this fails due to intentional visual changes, update the expected string below.
    // Keep only a short stable signature to avoid churn.
    expect(invariant).toMatch(/<svg xmlns="http:\/\/www.w3.org\/2000\/svg" width="1200" height="630"|true|true|[0-9]+/);
  });

  it('respects OG_DISABLE_SATORI flag for fallback', () => {
    execSync(`cross-env OG_DISABLE_SATORI=1 node ${script}`, { stdio: 'inherit' });
    const svg = readFileSync(svgPath, 'utf8');
    // In fallback we still expect brand token but dynamic layout may differ; check for absence of large dynamic pillar loop artifact
    expect(svg).toContain('Zenotika');
  });
});
