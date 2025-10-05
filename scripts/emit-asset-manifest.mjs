#!/usr/bin/env node
import { existsSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';

const buildDir = resolve(process.cwd(), 'build');
const outFile = join(buildDir, 'asset-manifest.txt');

if (!existsSync(buildDir)) {
  console.warn('[emit-asset-manifest] Build directory missing, skipping manifest generation.');
  process.exit(0);
}

function walk(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const rel = full.substring(buildDir.length + 1).replace(/\\/g, '/');
    const st = statSync(full);
    if (st.isDirectory()) results.push(...walk(full));
    else results.push(rel);
  }
  return results;
}

// Include js/css always, and png/svg/woff2 under size limits from assets folder
const MAX_IMAGE_BYTES = 400 * 1024; // 400 KB
const MAX_FONT_BYTES = 300 * 1024; // 300 KB

const files = walk(buildDir).filter((f) => {
  if (/\.(?:js|css)$/.test(f)) return true;
  if (!f.startsWith('assets/')) return false;
  if (/\.(?:png|svg)$/.test(f)) {
    const full = join(buildDir, f);
    try {
      const size = statSync(full).size;
      return size <= MAX_IMAGE_BYTES;
    } catch { return false; }
  }
  if (/\.(?:woff2)$/.test(f)) {
    const full = join(buildDir, f);
    try {
      const size = statSync(full).size;
      return size <= MAX_FONT_BYTES;
    } catch { return false; }
  }
  return false;
});
writeFileSync(outFile, files.join('\n'));
console.log('Wrote', outFile, 'with', files.length, 'assets');
