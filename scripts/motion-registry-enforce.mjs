#!/usr/bin/env node
/* Motion Registry Enforcement
   Scans CSS files for @keyframes and ensures each is defined only once and wrapped in a prefers-reduced-motion media query unless whitelisted.
*/
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const SRC = join(process.cwd(), 'src');
const CSS_DIRS = [join(SRC, 'styles'), SRC];
const whitelist = new Set(['spinRing']); // essential minimal spinner rotation
const registryPathFragment = ['src','styles','motion','registry.css'].join('/');
const STRICT = process.argv.includes('--strict');

function collectCssFiles(dir, acc=[]) {
  for (const entry of readdirSync(dir, { withFileTypes:true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) collectCssFiles(p, acc); else if (p.endsWith('.css')) acc.push(p);
  }
  return acc;
}

const files = CSS_DIRS.flatMap(d => collectCssFiles(d));
// Match real @keyframes (exclude those inside comments). We'll pre-strip comment blocks first.
const keyframeRegex = /@keyframes\s+([A-Za-z0-9_-]+)/g;
const occurrences = new Map();
let unguarded = [];
let outsideRegistry = new Set();

for (const file of files) {
  let text = readFileSync(file, 'utf8');
  // Remove block and line comments to prevent false positives from documentation notes
  text = text.replace(/\/\*[\s\S]*?\*\//g, '');
  text = text.replace(/(^|\n)\s*\/\/.*$/g, '$1');
  let m;
  while ((m = keyframeRegex.exec(text))) {
    const name = m[1];
    const list = occurrences.get(name) || [];
    list.push(file);
    occurrences.set(name, list);
    if (!file.replace(/\\/g,'/').endsWith(registryPathFragment)) {
      outsideRegistry.add(name);
    }
    // Check guard: look backward a bit for media query
    // Increase lookback window to reliably catch the wrapping media query in large registry blocks.
    const start = Math.max(0, m.index - 3000);
    const context = text.slice(start, m.index);
    const isRegistry = file.replace(/\\/g,'/').endsWith(registryPathFragment);
    if (!isRegistry && !/prefers-reduced-motion:\s*no-preference/.test(context) && !whitelist.has(name)) {
      unguarded.push({ name, file });
    }
  }
}

let duplicateWarnings = [];
for (const [name, filesArr] of occurrences.entries()) {
  const uniqueFiles = [...new Set(filesArr)];
  if (uniqueFiles.length > 1) duplicateWarnings.push({ name, files: uniqueFiles });
}

console.log('Motion Registry Report');
console.log('======================');
console.log('Total unique keyframes:', occurrences.size);
if (duplicateWarnings.length) {
  console.log('\nDuplicates:');
  duplicateWarnings.forEach(d => console.log(`  ${d.name} -> ${d.files.join(', ')}`));
} else {
  console.log('\nNo duplicate keyframes.');
}
if (unguarded.length) {
  console.log('\nUnguarded keyframes:');
  unguarded.forEach(u => console.log(`  ${u.name} in ${u.file}`));
} else {
  console.log('\nAll non-whitelisted keyframes guarded.');
}

if (outsideRegistry.size) {
  console.log('\nKeyframes defined outside registry:');
  outsideRegistry.forEach(n => console.log('  ' + n));
} else {
  console.log('\nAll keyframes sourced from registry.');
}

if (STRICT) {
  let fail = false;
  if (duplicateWarnings.length) fail = true;
  if (unguarded.length) fail = true;
  if (outsideRegistry.size) fail = true; // do not allow stray definitions
  if (fail) {
    console.error('\nMotion registry enforcement FAILED in --strict mode.');
    process.exit(1);
  } else {
    console.log('\nMotion registry enforcement passed (strict mode).');
  }
} else {
  console.log('\n(Advisory mode: enable --strict to fail CI on violations)');
}