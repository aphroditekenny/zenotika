#!/usr/bin/env node
/**
 * Shadow lint: flags raw box-shadow literals (rgba/hex) not using --zen-shadow- tokens.
 * Inspired by lint-colors.mjs.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const SRC_DIR = join(ROOT, 'src');
const CSS_EXT = new Set(['.css', '.tsx', '.ts', '.jsx', '.js']);
const HEX_OR_RGBA = /(box-shadow\s*:[^{;]*?(?:#([0-9a-fA-F]{3,8})|rgba?\([^;]*\)))/g;

let violations = [];

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (CSS_EXT.has(entry.name.slice(entry.name.lastIndexOf('.')))) {
      const source = readFileSync(full, 'utf8');
      let match;
      while ((match = HEX_OR_RGBA.exec(source))) {
        const segment = match[0];
        if (segment.includes('--zen-shadow-')) continue; // ok
        // allow token variable indirection via var(--zen-shadow*) also
        if (/var\(--zen-shadow-[^)]+\)/.test(segment)) continue;
        // allow currentColor glow token variant handled elsewhere
        if (segment.includes('currentColor')) continue;
        // disallow inset highlight raw patterns except the tokenized ones
        violations.push({ file: full, index: match.index, excerpt: segment.trim() });
      }
    }
  }
}

walk(SRC_DIR);

if (violations.length) {
  console.error(`Shadow lint failed: ${violations.length} potential raw box-shadow literals found.`);
  for (const v of violations) {
    console.error(`\nFile: ${v.file}\n${v.excerpt}`);
  }
  process.exit(1);
} else {
  console.log('Shadow lint passed: no disallowed raw box-shadow literals (rgba/hex) outside tokens.');
}
