#!/usr/bin/env node
/**
 * report-keyframes.mjs
 * Enumerate @keyframes declarations and check for reduced-motion guard usage.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOT = process.cwd();
const CSS_DIR = join(ROOT, 'src');
// Match actual @keyframes definitions (ignore those inside comments)
const KEY_REGEX = /@keyframes\s+([a-zA-Z0-9_-]+)/g;

function collectFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) out.push(...collectFiles(join(dir, entry.name)));
    else if (extname(entry.name) === '.css') out.push(join(dir, entry.name));
  }
  return out;
}

const files = collectFiles(CSS_DIR);
const instances = [];
for (const file of files) {
  const content = readFileSync(file, 'utf8');
  let m;
  // Track ranges of @media (prefers-reduced-motion) blocks
  const mediaRanges = [];
  const mediaRegex = /@media[^\{]*prefers-reduced-motion[^\{]*\{/gi;
  let mediaMatch;
  while ((mediaMatch = mediaRegex.exec(content))) {
    let depth = 1; let i = mediaRegex.lastIndex; // position after opening brace
    while (i < content.length && depth > 0) {
      if (content[i] === '{') depth++; else if (content[i] === '}') depth--;
      i++;
    }
    mediaRanges.push([mediaMatch.index, i]);
  }
  function isInsideMedia(idx) {
    return mediaRanges.some(([s,e]) => idx >= s && idx < e);
  }
  while ((m = KEY_REGEX.exec(content))) {
    // skip if preceding chars (up to line start) contain a block or line comment marker before '@'
    const start = m.index;
    const lineStart = content.lastIndexOf('\n', start) + 1;
    const prefix = content.slice(lineStart, start);
    if (/\/\//.test(prefix) || /\/\*/.test(prefix)) continue; // naive skip for commented lines
    const name = m[1];
    const guarded = isInsideMedia(start);
    instances.push({ file: file.replace(ROOT+"/",''), name, guarded });
  }
}
// Collapse duplicates by keyframe name (guarded if ANY instance is guarded)
const byName = new Map();
for (const inst of instances) {
  const existing = byName.get(inst.name);
  if (!existing) byName.set(inst.name, { name: inst.name, guarded: inst.guarded, files: [inst.file] });
  else {
    existing.guarded = existing.guarded || inst.guarded;
    if (!existing.files.includes(inst.file)) existing.files.push(inst.file);
  }
}
const results = Array.from(byName.values()).sort((a,b)=>a.name.localeCompare(b.name));
if (process.env.JSON) {
  const json = results.map(r=>({ name:r.name, guarded:r.guarded, files:r.files }));
  console.log(JSON.stringify({ total: results.length, unguarded: results.filter(r=>!r.guarded).length, keyframes: json }, null, 2));
} else {
  console.log('Keyframe Report');
  console.log('===============');
  for (const r of results) {
    console.log(`${r.name.padEnd(24)} ${r.guarded ? 'GUARDED ' : 'UNGUARDED '} ${r.files.join(',')}`);
  }
  const unguarded = results.filter(r=>!r.guarded).length;
  console.log(`Total: ${results.length}  Unguarded: ${unguarded}`);
}
