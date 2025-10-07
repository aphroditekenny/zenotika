#!/usr/bin/env node
/**
 * Lints the source tree for raw brand color literals that should be replaced
 * with semantic CSS custom properties. Exits non‑zero if any disallowed
 * occurrences are found (useful for CI).
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { relative, resolve, extname } from 'node:path';

const ROOT = resolve(process.cwd(), 'src');
const ALLOWED_EXTS = new Set(['.ts', '.tsx', '.css', '.md']);
// Raw brand literals we want to phase out (hex + key rgba fragments)
const PATTERNS = [
  /#a855f7/gi,
  /#f177a4/gi,
  /#667eea/gi,
  /#764ba2/gi,
  /#4952b0/gi,
  /#07002f/gi,
  /#0f0e16/gi,
  /#161f48/gi,
  /#060712/gi,
  /#faf9ff/gi,
  /#cbcfff/gi,
  /#2d3748(?![0-9a-f])/gi,
];

// Allow list: token source-of-truth files (globals + semantic colors)
const ALLOW_TOKEN_FILE = /styles[\\/]+(globals|tokens[\\/]+colors-semantic)\.css$/;

let failures = 0;

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = resolve(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full);
    else if (ALLOWED_EXTS.has(extname(entry))) inspect(full);
  }
}

function inspect(file) {
  const rel = relative(process.cwd(), file);
  const text = readFileSync(file, 'utf8');
  const lines = text.split(/\r?\n/);
  lines.forEach((line, i) => {
    PATTERNS.forEach(p => {
      if (p.test(line)) {
        // Allow token source of truth
        if (ALLOW_TOKEN_FILE.test(rel)) return;
        failures++;
        console.log(`Disallowed color literal in ${rel}:${i + 1} => ${line.trim()}`);
      }
      p.lastIndex = 0; // reset regex state for global patterns
    });
  });
}

walk(ROOT);

if (failures > 0) {
  console.error(`\nColor lint failed: ${failures} disallowed occurrence(s) found.`);
  process.exit(1);
} else {
  console.log('Color lint passed: no disallowed brand literals found outside token file.');
}