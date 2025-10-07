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
  // Layout / paint heavy properties we want to avoid animating
  'width','height','top','left','right','bottom','margin','padding','border','border-radius','box-shadow','filter'
]);

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
for (const file of files){
  const css = readFileSync(file,'utf8');
  const guards = findGuards(css);
  const blocks = extractKeyframes(css);
  for (const b of blocks){
    total++;
    const isGuarded = inside(guards, b.start);
    if (isGuarded) guarded++;
    // naive property scan inside block
    const propRx = /([a-zA-Z-]+)\s*:/g; let p; const found=new Set();
    while((p=propRx.exec(b.css))){ const prop=p[1].toLowerCase(); if(DISALLOWED.has(prop)) found.add(prop); }
    if (found.size>0) unsafe++;
    summary.push({ name:b.name, file:file.replace(ROOT+"/",''), guarded:isGuarded, disallowed:[...found] });
  }
}

const report = { total, guarded, guardedPct: total? +(guarded/total*100).toFixed(2):0, unsafeBlocks: unsafe, unsafePct: total? +(unsafe/total*100).toFixed(2):0, keyframes: summary };
writeFileSync('style-animation-report.json', JSON.stringify(report,null,2));
console.log('Animation safety report written to style-animation-report.json');
