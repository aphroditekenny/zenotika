#!/usr/bin/env node
/**
 * report-animation-safety.mjs
 * Scans CSS keyframe blocks for disallowed / high-cost properties and summarizes guard coverage.
 * Output: style-animation-report.json (unless RAW output chosen)
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOT = process.cwd();
const SRC = join(ROOT, 'src');
const DISALLOWED = new Set([
  // Layout / paint heavy properties to avoid animating (except in deliberate guarded cases)
  'width','height','top','left','right','bottom','margin','padding','border','border-radius','box-shadow','filter'
]);

// Quick & cheap comment stripper (heuristic): removes /* ... */ and // ... end-of-line
function stripComments(css){
  return css
    .replace(/\/\*[\s\S]*?\*\//g,'')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

function collectCSS(dir) {
  const out=[]; for (const e of readdirSync(dir,{withFileTypes:true})) {
    if (e.isDirectory()) out.push(...collectCSS(join(dir,e.name)));
    else if (extname(e.name)==='.css') out.push(join(dir,e.name));
  } return out;
}

function extractKeyframes(content){
  const blocks=[]; const rx=/@keyframes\s+([a-zA-Z0-9_-]+)\s*\{/g; let m;
  while((m=rx.exec(content))){
    let depth=1; let i=rx.lastIndex; while(i<content.length && depth>0){ if(content[i]=='{') depth++; else if(content[i]=='}') depth--; i++; }
    blocks.push({ name:m[1], start:m.index, end:i, css:content.slice(m.index,i) });
  }
  return blocks;
}

function findGuards(content){
  const ranges=[]; const rx=/@media[^{]*prefers-reduced-motion[^{]*\{/gi; let m;
  while((m=rx.exec(content))){ let depth=1; let i=rx.lastIndex; while(i<content.length && depth>0){ if(content[i]==='{') depth++; else if(content[i]==='}') depth--; i++; } ranges.push([m.index,i]); }
  return ranges;
}
function inside(ranges, idx){ return ranges.some(([s,e])=> idx>=s && idx<e); }

const files = collectCSS(SRC);
const summary = [];
let total=0, guarded=0, unsafe=0;
const seen = new Set(); // name::file to dedupe duplicate definitions
for (const file of files){
  let raw = readFileSync(file,'utf8');
  const css = stripComments(raw);
  const guards = findGuards(css);
  const blocks = extractKeyframes(css);
  for (const b of blocks){
    const key = b.name+"::"+file;
    if (seen.has(key)) continue; // skip duplicate (first wins)
    seen.add(key);
    total++;
    const isGuarded = inside(guards, b.start);
    if (isGuarded) guarded++;
    // property scan
    const propRx = /([a-zA-Z-]+)\s*:/g; let p; const found=new Set();
    while((p=propRx.exec(b.css))){ const prop=p[1].toLowerCase(); if(DISALLOWED.has(prop)) found.add(prop); }
    if (found.size>0) unsafe++;
    summary.push({ name:b.name, file:file.replace(ROOT+"/",''), guarded:isGuarded, disallowed:[...found] });
  }
}

// Classify severity for unsafe blocks
function classifySeverity(entry){
  if (!entry.disallowed || entry.disallowed.length===0) return 'none';
  if (entry.disallowed.some(p=> p==='filter' || p==='box-shadow')) return 'high';
  if (entry.disallowed.some(p=> p.startsWith('border'))) return 'medium';
  return 'low';
}
const enhanced = summary.map(k=> ({ ...k, severity: classifySeverity(k) }));
const unsafeBlocksDetailed = enhanced.filter(k=> k.disallowed.length>0);
const report = { total, guarded, guardedPct: total? +(guarded/total*100).toFixed(2):0, unsafeBlocks: unsafe, unsafePct: total? +(unsafe/total*100).toFixed(2):0, keyframes: enhanced };
if (unsafeBlocksDetailed.length){
  console.log('[animation-safety] Unsafe keyframes:');
  unsafeBlocksDetailed.slice(0,10).forEach(k=> console.log(` - ${k.name} (${k.file}) props=[${k.disallowed.join(', ')}] severity=${k.severity}`));
}
const highSeverity = unsafeBlocksDetailed.filter(k=> k.severity === 'high');
if (highSeverity.length){
  const prefix = process.env.ALLOW_UNSAFE_ANIMATIONS ? '[animation-safety] (ALLOW_UNSAFE_ANIMATIONS) ' : '[animation-safety] ';
  const message = `${prefix}High severity keyframes detected (${highSeverity.length}).`;
  const logger = process.env.ALLOW_UNSAFE_ANIMATIONS ? console.warn : console.error;
  logger(message);
  highSeverity.forEach(k=> logger(`   × ${k.name} (${k.file}) props=[${k.disallowed.join(', ')}]`));
  if (!process.env.ALLOW_UNSAFE_ANIMATIONS) {
    process.exitCode = 1;
  }
}
writeFileSync('style-animation-report.json', JSON.stringify(report,null,2));
console.log('Animation safety report written to style-animation-report.json');
