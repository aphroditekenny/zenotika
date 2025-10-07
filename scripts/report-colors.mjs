#!/usr/bin/env node
/**
 * report-colors.mjs
 * Scans CSS files for raw hex colors and lists frequency + suggested tokenization action.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOT = process.cwd();
const CSS_DIR = join(ROOT, 'src');
const HEX_REGEX = /#[0-9a-fA-F]{3,8}\b/g;

function collectFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) out.push(...collectFiles(join(dir, entry.name)));
    else if (extname(entry.name) === '.css') out.push(join(dir, entry.name));
  }
  return out;
}

const files = collectFiles(CSS_DIR).filter(f => !/src[\\/]+styles[\\/]+tokens[\\/]/.test(f));
const freq = new Map();
const fileUsage = new Map();

for (const file of files) {
  const content = readFileSync(file, 'utf8');
  const matches = content.match(HEX_REGEX);
  if (matches) {
    matches.forEach(hex => {
      const h = hex.toLowerCase();
      freq.set(h, (freq.get(h) || 0) + 1);
      if (!fileUsage.has(h)) fileUsage.set(h, new Set());
      fileUsage.get(h).add(file.replace(ROOT+"/",''));
    });
  }
}

const sorted = [...freq.entries()].sort((a,b)=> b[1]-a[1]);
console.log('Raw Hex Color Report');
console.log('====================');
console.log(`Total unique: ${sorted.length}`);
for (const [hex,count] of sorted) {
  const usage = [...fileUsage.get(hex)].slice(0,4).join(', ');
  let note = '';
  if (count > 10) note = 'HIGH: create semantic token';
  else if (count > 3) note = 'MED: map to existing brand/base palette';
  else note = 'LOW: inline or consolidate later';
  console.log(`${hex.padEnd(10)} count=${String(count).padEnd(4)} ${note} ${usage}`);
}
