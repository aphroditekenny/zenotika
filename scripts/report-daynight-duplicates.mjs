#!/usr/bin/env node
/**
 * report-daynight-duplicates.mjs
 * Identify potential duplicated DOM patterns for day/night variants by scanning for classnames
 * starting with day- or night- that share the same suffix and appear in the same file.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOT = process.cwd();
const SRC = join(ROOT, 'src');
const CLASS_REGEX = /className="([^"]+)"/g;

function collectFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) out.push(...collectFiles(join(dir, entry.name)));
    else if (extname(entry.name).startsWith('.ts') || extname(entry.name).startsWith('.tsx')) out.push(join(dir, entry.name));
  }
  return out;
}

const files = collectFiles(SRC);
const duplicates = [];
for (const file of files) {
  const content = readFileSync(file, 'utf8');
  const dayNightMap = new Map(); // suffix -> { day: boolean, night: boolean }
  let m;
  while ((m = CLASS_REGEX.exec(content))) {
    const classes = m[1].split(/\s+/);
    for (const c of classes) {
      if (c.startsWith('day-') || c.startsWith('night-')) {
        const suffix = c.replace(/^day-|^night-/, '');
        const record = dayNightMap.get(suffix) || { day:false, night:false };
        if (c.startsWith('day-')) record.day = true; else record.night = true;
        dayNightMap.set(suffix, record);
      }
    }
  }
  for (const [suffix, rec] of dayNightMap.entries()) {
    if (rec.day && rec.night) {
      duplicates.push({ file: file.replace(ROOT+"/",''), suffix });
    }
  }
}

console.log('Day/Night Duplicate DOM Report');
console.log('================================');
if (!duplicates.length) {
  console.log('No direct day-/night- sibling patterns detected.');
} else {
  for (const d of duplicates) console.log(`${d.suffix.padEnd(20)} ${d.file}`);
  console.log(`Total potential duplicates: ${duplicates.length}`);
}
