#!/usr/bin/env node
/*
  Reports unused `.w-*` legacy classes by scanning CSS definitions and grepping JSX/HTML usage.
  Heuristic: collects class names declared in legacy/webflow.css and index.css, then searches source files.
*/
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const SRC = join(root, 'src');
const LEGACY = join(SRC, 'styles', 'legacy', 'webflow.css');
const INDEX = join(SRC, 'index.css');

function collectFiles(dir, exts, acc = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) collectFiles(p, exts, acc); else if (exts.some(e => p.endsWith(e))) acc.push(p);
  }
  return acc;
}

function extractWClasses(css) {
  const set = new Set();
  const regex = /\.((?:w|w-)[A-Za-z0-9_-]+)/g; // matches .w-... and potential .wButton variants
  let m; while((m = regex.exec(css))) { set.add(m[1]); }
  return set;
}

const cssSources = [LEGACY, INDEX].map(f => readFileSync(f, 'utf8'));
const allClasses = new Set();
cssSources.forEach(c => extractWClasses(c).forEach(cls => allClasses.add(cls)));

const contentFiles = collectFiles(SRC, ['.tsx', '.ts', '.jsx', '.js', '.html']);
const usageMap = new Map([...allClasses].map(c => [c, 0]));

for (const file of contentFiles) {
  const text = readFileSync(file, 'utf8');
  for (const cls of allClasses) {
    if (text.includes(cls)) usageMap.set(cls, usageMap.get(cls)+1);
  }
}

const unused = [...usageMap.entries()].filter(([,count]) => count === 0).map(([c]) => c).sort();
console.log('Legacy .w-* Class Usage Report');
console.log('================================');
console.log('Total legacy classes found:', allClasses.size);
console.log('Unused classes:', unused.length); 
if (unused.length) {
  for (const c of unused) console.log('UNUSED', c);
  console.log('\nTo remove safely: delete rules from legacy/webflow.css referencing these classes.');
} else {
  console.log('No unused legacy classes detected.');
}

// Exit code 0 always (advisory). Could add flag to fail when unused > threshold.